# volcanium-components docs

Standalone documentation site for `@volcanium/volcanium-components`, built with Vite + React + TypeScript. It is fully independent of Storybook: it imports components directly from the library's `../src` sources via the `@lib` alias, and does not use or touch `.storybook/` or any `*.stories.tsx` file.

## Run locally

```bash
npm install
npm run dev
```

(or from the repo root: `npm run docs:dev`)

## Build

```bash
npm run build
```

(or from the repo root: `npm run docs:build`)

Outputs a static site to `docs-site/dist`.
