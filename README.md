# Fabrica

Minecraft Data pack/Add-on Maker For Java/Bedrock Edition by Silver Dev Studios

## Development

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## GitHub Pages

The site builds as a fully static bundle, so it can be hosted on GitHub Pages.
A [GitHub Actions workflow](.github/workflows/deploy-pages.yml) automatically
builds and deploys the site whenever changes are pushed to `main`.

### One-time setup

1. In the repository's **Settings → Pages**, set **Source** to
   **"GitHub Actions"** (not "Deploy from a branch").
2. If your organization requires approval for environments, approve the
   `github-pages` environment when the first deployment runs.

Once the workflow finishes, the site is live at
`https://<owner>.github.io/Fabrica/`.

### Routing

The app uses a hash-based router (`HashRouter`). All routes live under
`/Fabrica/#/...` (e.g. `/Fabrica/#/make` and `/Fabrica/#/formats`), which
works on any static host without server-side URL rewrites. To deploy under a
different sub-path, change `base` in `vite.config.js`.
