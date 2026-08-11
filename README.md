# Alain Poitevin — CV / portfolio

Static Angular portfolio presenting Alain Poitevin's data-quality, BI, delivery, and development experience.

## Prerequisites

- Node.js 24 or newer (see `engines` in `package.json`)
- npm 11.16.0 (see `packageManager` in `package.json`)
- Gitleaks on `PATH` for the pre-push security check

## Install

```shell
npm install
```

The install also configures the repository's Husky hooks.

## Run locally

```shell
npm start
```

Then open <http://localhost:4200/>.

## Test and lint

```shell
npm run test:ci
npm run lint
```

For the browser layout/accessibility check, install Chromium once and run the dev server before the check:

```shell
npx playwright install chromium
npm start
npm run layout:check
```

## Build

```shell
npm run build
```

Production output goes to `dist/portfolio/browser`.

To verify the GitHub Pages subpath build locally:

```shell
npx ng build --configuration production --base-href /portfolio/
```

## Deployment configuration

`.github/workflows/deploy.yml` is configured to build and deploy from `main` through GitHub Pages. The intended project-page URL is <https://poiteal-ops.github.io/portfolio/>. Deployment is not considered complete until the workflow succeeds and that URL is checked.

## Privacy and security

- The site has no cookies, analytics, forms, or third-party embeds.
- Barlow fonts are bundled locally; visitors do not contact Google Fonts.
- Theme and GitHub-content consent choices are stored locally in `localStorage`.
- Cached project metadata loads without third-party access.
- GitHub is contacted only after opt-in. GitHub then receives normal request metadata, such as the visitor's IP address and user agent.
- Declining GitHub access, or a failed request, keeps the cached project content visible.
- The `tetsurai` and `portfolio` repositories, forks, and archived repositories are excluded.
- No GitHub token or other credentials are shipped to the browser.
- `.husky/pre-push` blocks pushes when Gitleaks detects a likely secret or `npm audit` finds a high/critical vulnerability.

Install Gitleaks on Windows with:

```shell
winget install --id Gitleaks.Gitleaks -e
```
