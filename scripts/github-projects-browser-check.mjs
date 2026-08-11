#!/usr/bin/env node

import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const GITHUB_API_URL =
  'https://api.github.com/users/poiteal-ops/repos?per_page=100&sort=updated';
const CONSENT_STORAGE_KEY = 'github-content-consent';
const VIEWPORT_WIDTHS = [360, 1440];
const CACHED_PROJECT_NAMES = ['EtterbeekCriminals', 'OracleSchemaComp', 'CsvSeparator'];
const DISCLAIMER =
  'These are personal projects only. Work completed under contract is confidential and is not represented here.';

const LIVE_REPOSITORIES = [
  {
    name: 'OlderLiveProject',
    description: 'An older eligible live project',
    html_url: 'https://github.com/poiteal-ops/OlderLiveProject',
    language: 'Python',
    updated_at: '2026-06-01T09:00:00Z',
    fork: false,
    archived: false,
  },
  {
    name: 'tetsurai',
    description: 'Excluded by repository name',
    html_url: 'https://github.com/poiteal-ops/tetsurai',
    language: 'TypeScript',
    updated_at: '2026-08-09T09:00:00Z',
    fork: false,
    archived: false,
  },
  {
    name: 'NewestLiveProject',
    description: 'The newest eligible live project',
    html_url: 'https://github.com/poiteal-ops/NewestLiveProject',
    language: 'TypeScript',
    updated_at: '2026-08-08T09:00:00Z',
    fork: false,
    archived: false,
  },
  {
    name: 'portfolio',
    description: 'Excluded by repository name',
    html_url: 'https://github.com/poiteal-ops/portfolio',
    language: 'TypeScript',
    updated_at: '2026-08-07T09:00:00Z',
    fork: false,
    archived: false,
  },
  {
    name: 'ForkedProject',
    description: 'Excluded because it is a fork',
    html_url: 'https://github.com/poiteal-ops/ForkedProject',
    language: 'JavaScript',
    updated_at: '2026-08-06T09:00:00Z',
    fork: true,
    archived: false,
  },
  {
    name: 'ArchivedProject',
    description: 'Excluded because it is archived',
    html_url: 'https://github.com/poiteal-ops/ArchivedProject',
    language: 'JavaScript',
    updated_at: '2026-08-05T09:00:00Z',
    fork: false,
    archived: true,
  },
];

function parseBaseUrl(argv) {
  const optionIndex = argv.indexOf('--base-url');
  if (optionIndex === -1) {
    return 'http://localhost:4200';
  }

  const value = argv[optionIndex + 1];
  if (!value || value.startsWith('--')) {
    throw new Error('--base-url requires a URL value.');
  }

  return value.replace(/\/+$/, '');
}

function collectBrowserIssues(page) {
  const issues = [];

  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      issues.push(`[console.${message.type()}] ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => issues.push(`[pageerror] ${error.message}`));

  return issues;
}

async function projectNames(projectsRegion) {
  return projectsRegion.getByRole('heading', { level: 3 }).allTextContents();
}

async function assertCommonChecks(page, projectsRegion, scenario, width, browserIssues) {
  await projectsRegion.getByText(DISCLAIMER, { exact: true }).waitFor({ state: 'visible' });

  const dimensions = await page.evaluate(() => ({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.scrollWidth <= dimensions.innerWidth + 1,
    `${scenario} @${width}px has horizontal overflow: scrollWidth=${dimensions.scrollWidth}, innerWidth=${dimensions.innerWidth}`,
  );

  const axeResults = await new AxeBuilder({ page }).analyze();
  const blockingViolations = axeResults.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  assert.deepEqual(
    blockingViolations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      targets: nodes.map((node) => node.target.join(' ')),
    })),
    [],
    `${scenario} @${width}px has serious/critical accessibility violations`,
  );

  assert.deepEqual(browserIssues, [], `${scenario} @${width}px emitted browser errors or warnings`);
}

async function openHome(context, baseUrl, width) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  const browserIssues = collectBrowserIssues(page);
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });

  const projectsRegion = page.getByRole('region', { name: 'Public projects' });
  await projectsRegion.waitFor({ state: 'visible' });
  return { page, projectsRegion, browserIssues };
}

async function runScenario(browser, baseUrl, scenario) {
  const context = await browser.newContext();
  let requestCount = 0;

  await context.route(GITHUB_API_URL, async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(scenario.responseBody),
    });
  });

  try {
    for (const width of VIEWPORT_WIDTHS) {
      requestCount = 0;
      const { page, projectsRegion, browserIssues } = await openHome(context, baseUrl, width);

      try {
        await scenario.verify({ page, projectsRegion, requestCount: () => requestCount });
        await assertCommonChecks(
          page,
          projectsRegion,
          scenario.name,
          width,
          browserIssues,
        );
        console.log(`PASS  ${scenario.name} @${width}px`);
      } finally {
        await page.evaluate((storageKey) => localStorage.removeItem(storageKey), CONSENT_STORAGE_KEY);
        await page.close();
      }
    }
  } finally {
    await context.close();
  }
}

const scenarios = [
  {
    name: 'unknown/decline',
    responseBody: [],
    async verify({ page, projectsRegion, requestCount }) {
      await projectsRegion
        .getByText('Showing saved project information.', { exact: true })
        .waitFor({ state: 'visible' });
      assert.deepEqual(await projectNames(projectsRegion), CACHED_PROJECT_NAMES);
      assert.equal(requestCount(), 0, 'unknown consent contacted GitHub');

      const declineButton = page.getByRole('button', { name: 'Continue without GitHub' });
      await declineButton.focus();
      assert.equal(
        await declineButton.evaluate((button) => button === document.activeElement),
        true,
        'decline button did not receive keyboard focus',
      );
      await page.keyboard.press('Enter');
      await projectsRegion
        .getByText('GitHub connection declined. Showing saved project information.', { exact: true })
        .waitFor({ state: 'visible' });
      assert.equal(requestCount(), 0, 'declined consent contacted GitHub');
      assert.deepEqual(await projectNames(projectsRegion), CACHED_PROJECT_NAMES);
      assert.equal(
        await page.evaluate((storageKey) => localStorage.getItem(storageKey), CONSENT_STORAGE_KEY),
        'declined',
      );

      const preferencesButton = page.getByRole('button', { name: 'Privacy preferences' });
      await preferencesButton.focus();
      assert.equal(
        await preferencesButton.evaluate((button) => button === document.activeElement),
        true,
        'privacy preferences button did not receive keyboard focus',
      );
      await page.keyboard.press('Space');

      const reopenedNotice = page.getByRole('dialog', { name: 'GitHub content preferences' });
      await reopenedNotice.waitFor({ state: 'visible' });
      await reopenedNotice
        .getByText('GitHub content is currently disabled. You can change this choice at any time.', {
          exact: true,
        })
        .waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await reopenedNotice.waitFor({ state: 'hidden' });

      assert.equal(requestCount(), 0, 'reopening and closing declined preferences contacted GitHub');
      assert.equal(
        await page.evaluate((storageKey) => localStorage.getItem(storageKey), CONSENT_STORAGE_KEY),
        'declined',
        'Escape changed the stored consent decision',
      );
    },
  },
  {
    name: 'allow/success',
    responseBody: LIVE_REPOSITORIES,
    async verify({ page, projectsRegion, requestCount }) {
      await page.getByRole('button', { name: 'Allow GitHub content' }).click();
      await projectsRegion
        .getByText('Showing live project information from GitHub.', { exact: true })
        .waitFor({ state: 'visible' });

      assert.equal(requestCount(), 1, 'allowing GitHub content did not make exactly one request');
      assert.deepEqual(await projectNames(projectsRegion), [
        'NewestLiveProject',
        'OlderLiveProject',
      ]);
      for (const excludedName of ['tetsurai', 'portfolio', 'ForkedProject', 'ArchivedProject']) {
        assert.equal(
          await projectsRegion.getByRole('heading', { name: excludedName, exact: true }).count(),
          0,
          `${excludedName} should be excluded from live projects`,
        );
      }
      assert.equal(
        await page.evaluate((storageKey) => localStorage.getItem(storageKey), CONSENT_STORAGE_KEY),
        'allowed',
      );
    },
  },
  {
    name: 'allow/failure',
    responseBody: { message: 'temporarily unavailable' },
    async verify({ page, projectsRegion, requestCount }) {
      await page.getByRole('button', { name: 'Allow GitHub content' }).click();
      await projectsRegion
        .getByText('GitHub is currently unavailable. Showing saved project information.', {
          exact: true,
        })
        .waitFor({ state: 'visible' });

      assert.equal(requestCount(), 1, 'failure fallback did not make exactly one request');
      assert.deepEqual(await projectNames(projectsRegion), CACHED_PROJECT_NAMES);
      assert.equal(
        await page.evaluate((storageKey) => localStorage.getItem(storageKey), CONSENT_STORAGE_KEY),
        'allowed',
      );
    },
  },
];

async function main() {
  const baseUrl = parseBaseUrl(process.argv.slice(2));
  const browser = await chromium.launch();

  try {
    for (const scenario of scenarios) {
      await runScenario(browser, baseUrl, scenario);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
