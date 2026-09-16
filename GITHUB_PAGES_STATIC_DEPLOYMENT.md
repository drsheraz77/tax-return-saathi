# GitHub Pages Static-Frontend Deployment

This repository now includes `.github/workflows/deploy-pages.yml`. It builds the Vite browser bundle into `dist/public` and deploys that artifact through the GitHub Pages Actions flow. GitHub Pages must be configured to use **GitHub Actions** as its publishing source before the workflow can deploy. GitHub requires the Pages deployment token permissions and build/deploy job relationship included in this workflow.[1]

## Initial configuration

First, open the repository on GitHub and choose **Settings → Pages**. Under **Build and deployment**, select **GitHub Actions**. Then push the workflow to the `main` branch. Future pushes to `main`, or a manual **Run workflow** action, will build the browser-only artifact and deploy it.

The workflow uses pnpm, Node.js 22, `pnpm install --frozen-lockfile`, and `pnpm exec vite build`. Its artifact path is deliberately `dist/public`, which is this project’s Vite output folder—not the full `dist` directory that also contains the Node server build.

| GitHub Pages URL type | Repository Actions variable `PAGES_BASE_PATH` |
|---|---|
| `https://<account>.github.io/<repository>/` | Leave unset; the workflow defaults to `/<repository>/`. |
| `https://<account>.github.io/` from the special account site repository | Set to `/`. |
| A GitHub Pages custom domain such as `www.example.org` | Set to `/`. |

Set the variable in **Settings → Secrets and variables → Actions → Variables**. Vite requires a root base path for a custom domain or account site and a repository base path for a project site.[2]

## Static-hosting boundary

> This workflow deploys the **frontend only**. It does not deploy the Node/Express server, database, or project secrets.

| Available in the static bundle | Not available on GitHub Pages |
|---|---|
| Client-side educational content, language selection, local-only checklist state, and the consent interface | `/api/trpc`, `/api/claude`, login/logout, account-owned preferences and deletion, feedback persistence, feedback owner alerts, visitor aggregate recording, and the authenticated owner visitor dashboard |
| Optional Google Analytics after a visitor explicitly opts in, because it is loaded directly by the browser | Any server-side privacy, storage, authentication, notification, or database behavior |

Do **not** put server secrets, database credentials, owner tokens, or an Anthropic key into GitHub Actions variables or `VITE_*` environment variables for a static deployment. A static bundle is delivered to every browser. Directly opening or refreshing a client-side route such as `/privacy` may also return GitHub Pages’ 404 response because GitHub Pages does not supply this application’s server-side route fallback.

## Verification performed

The workflow uses the official Pages artifact/deploy actions and the required permissions documented by GitHub.[1] A local equivalent static command, `pnpm exec vite build --base /tax-return-saathi/`, was used to verify that the artifact builds under a GitHub project-site base path. The workflow YAML was also parsed by the project formatter.

## References

1. [GitHub Docs — Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
2. [Vite — Deploying a static site to GitHub Pages](https://vite.dev/guide/static-deploy)
