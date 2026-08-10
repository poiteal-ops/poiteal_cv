#!/usr/bin/env node
// Layout check (step 2): console errors, horizontal overflow, a11y smoke test.
// Requires devDependencies: playwright, @axe-core/playwright.
// Requires a dev server already running (default http://localhost:4200).
//
// Usage:
//   node layout-check.mjs [--base-url http://localhost:4200] [--routes-file routes.json] [--breakpoints 360,768,1024,1440]
//
// Route discovery: if --routes-file is omitted, best-effort parses
// src/app/app.routes.ts for top-level `path: '...'` string literals,
// skipping '**' and redirect-only entries.

import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

function parseArgs(argv) {
  const args = {
    baseUrl: 'http://localhost:4200',
    breakpoints: [360, 768, 1024, 1440],
    themes: ['light', 'dark'],
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base-url') args.baseUrl = argv[++i];
    else if (argv[i] === '--routes-file') args.routesFile = argv[++i];
    else if (argv[i] === '--breakpoints') args.breakpoints = argv[++i].split(',').map(Number);
    else if (argv[i] === '--themes') args.themes = argv[++i].split(',');
  }
  return args;
}

function discoverRoutes(routesFile) {
  if (routesFile) {
    return JSON.parse(readFileSync(routesFile, 'utf8'));
  }
  const routesTs = 'src/app/app.routes.ts';
  if (!existsSync(routesTs)) {
    throw new Error(
      `No --routes-file given and ${routesTs} not found. Pass --routes-file with a JSON array of paths, e.g. ["", "about", "blog"].`,
    );
  }
  const src = readFileSync(routesTs, 'utf8');
  const matches = [...src.matchAll(/path:\s*'([^']*)'/g)].map((m) => m[1]);
  return matches.filter((p) => p !== '**');
}

async function checkRoute(browser, baseUrl, route, width, theme) {
  const context = await browser.newContext({ viewport: { width, height: 800 } });
  await context.addInitScript((activeTheme) => {
    localStorage.setItem('cv-theme', activeTheme);
  }, theme);
  const page = await context.newPage();
  const consoleIssues = [];

  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleIssues.push(`[console.${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => consoleIssues.push(`[pageerror] ${err.message}`));

  const url = `${baseUrl}/${route}`.replace(/\/+$/, '') || baseUrl;
  await page.goto(url, { waitUntil: 'networkidle' });

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const overflow = scrollWidth > width + 1; // 1px tolerance for scrollbar rounding

  const axeResults = await new AxeBuilder({ page }).analyze();
  const seriousViolations = axeResults.violations.filter((v) =>
    ['serious', 'critical'].includes(v.impact),
  );

  await context.close();

  return {
    route: route || '(home)',
    width,
    theme,
    consoleIssues,
    overflow: overflow ? { scrollWidth, viewport: width } : null,
    a11yViolations: seriousViolations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((node) => ({
        target: node.target.join(' '),
        summary: node.failureSummary,
      })),
    })),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const routes = discoverRoutes(args.routesFile);
  const browser = await chromium.launch();
  const results = [];

  for (const route of routes) {
    for (const theme of args.themes) {
      for (const width of args.breakpoints) {
        results.push(await checkRoute(browser, args.baseUrl, route, width, theme));
      }
    }
  }
  await browser.close();

  let failed = false;
  for (const r of results) {
    const problems = [];
    if (r.consoleIssues.length) problems.push(...r.consoleIssues);
    if (r.overflow) problems.push(`horizontal overflow: scrollWidth=${r.overflow.scrollWidth} > viewport=${r.overflow.viewport}`);
    for (const v of r.a11yViolations) {
      problems.push(`a11y [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
      for (const node of v.nodes) {
        problems.push(`${node.target}: ${node.summary}`);
      }
    }

    if (problems.length) {
      failed = true;
      console.log(`FAIL  /${r.route}  ${r.theme}  @${r.width}px`);
      for (const p of problems) console.log(`      - ${p}`);
    } else {
      console.log(`PASS  /${r.route}  ${r.theme}  @${r.width}px`);
    }
  }

  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
