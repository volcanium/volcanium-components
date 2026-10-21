# Volcanium UI Components

Bibliothèque de composants React/TypeScript de Volcanium (Tailwind CSS 4). / React/TypeScript UI component library by Volcanium.

## Installation

Le paquet est publié sur GitHub Packages. Dans le projet qui le consomme, `.npmrc` :

```
@volcanium:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` : jeton GitHub avec le droit `read:packages`. Puis :

```
npm install @volcanium/volcanium-components
```

Pairs requis : `react`, `react-dom`, `react-router-dom`.

## Utilisation

```tsx
import "@volcanium/volcanium-components/src/index.css"; // après `@import "tailwindcss"`
import { VolcaniumProvider, Button } from "@volcanium/volcanium-components";

<VolcaniumProvider config={{ lang: "fr" }}>
  <Button>Valider</Button>
</VolcaniumProvider>
```

- `config.lang` / `config.theme` : la langue (et le thème) de l'app, suivis si elle change. Sans `config.theme`, le thème mémorisé est repris (`localStorage`, clé `volcanium-theme`, désactivable avec `themeStorageKey={false}`).
- Tous les composants lisent leurs couleurs dans des variables CSS `vc-*` : voir `CONTRIBUTING.md`.

## Développement

- `npm run storybook` : Storybook (bascule clair/sombre via `data-theme`)
- `npm run docs:dev` : site de documentation (`docs-site/`)
- `npm run build` : build `tsup` (`dist/`)

## Notifications entre apps (3.7.0)
`<NotificationProvider compteUrl userId>` (dans `VolcaniumProvider`, à côté de `PresenceProvider`) ouvre un flux vers Volcanium Compte et affiche les notifications des autres apps : carte en haut à droite (`NotificationCard`) et sonnerie synthétisée pour les appels entrants. `useNotifications()` pour afficher soi-même. Voir `Documentation/09-notifications.md`.
