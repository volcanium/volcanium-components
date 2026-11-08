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

## Notifications entre apps (3.7.0, boutons-icônes et `openHref` en 3.8.0)
`<NotificationProvider compteUrl userId>` (dans `VolcaniumProvider`, à côté de `PresenceProvider`) ouvre un flux vers Volcanium Compte et affiche les notifications des autres apps : carte en haut à droite (`NotificationCard`) et sonnerie synthétisée pour les appels entrants. `useNotifications()` pour afficher soi-même. Voir `Documentation/09-notifications.md`.
Depuis 3.11.0 : petit son synthétisé (`chime`, défaut `true`) pour les notifications non-appel et non `silent` (timbres message / mail / autre, `priority: "high"` plus marqué ; un seul onglet, un son par 1,2 s, pas de re-ding pour un même `id` en moins de 5 s, rien tant que la personne n'a pas cliqué dans la page), prop `suppress(item)` pour ne ni afficher ni sonner une notification dans cette app (ex. conversation déjà ouverte), icône par défaut selon `kind`, clic sur la carte = action `open`, expiration en pause au survol/focus, libellés fr/en/es.

## Mobile (3.10.0)
Sous **640 px** (point de rupture `sm` de Tailwind), les composants passent en mode téléphone : cibles tactiles de 40 à 44 px, champs à 16 px (pas de zoom iOS), menus, calendrier et fenêtres qui ne sortent pas de l'écran, `dvh`, zones sûres (`env(safe-area-inset-*)`), tableaux qui défilent à l'horizontale, infobulles désactivées (pas de survol). **À partir de 640 px rien ne change.** Ajouts facultatifs : `Sidebar` `hideMobileTrigger`, `MessageItem` `actionsVisible`, `MessageItem` `renderAuthor` (photo et nom de l'auteur cliquables, ex. dans un `ProfilePopover`), `VideoTile` `deafened` / `deafenedLabel` / `actionsVisible`. Utilitaire interne `isMobileViewport()` (`src/utils/viewport.ts`). Pour que les zones sûres s'appliquent, l'app met `viewport-fit=cover` dans sa balise `viewport`.

## Changelog

### 3.23.0
- `legalLinkLabel(id, langue)`, `LEGAL_LINK_LABELS`, `LEGAL_LINK_IDS` : libellés courts uniques des liens légaux du pied de sidebar (CGU, Confidentialité, Mentions légales, Cookies, Vos droits ; fr/en/es), à utiliser dans toutes les apps.

### 3.22.1
- `Sidebar` : pied légal sur 3 liens par ligne au maximum (5 liens = 3 + 2).

### 3.22.0
- `Textarea` : pleine largeur, 3 lignes par défaut (`rows`), poignée verticale, `autoGrow` / `maxRows`, mêmes bordure/rayon/marges que `Input`, `ref` transmis.
- `DatePicker` : saisie clavier plus tolérante (`4/11/26`, `04.11.2026`, ISO), validation à Entrée / perte de focus, bordure rouge si invalide, vidage = `onChange("")`, flèche bas ouvre le calendrier. Nouveaux : `TimePicker` (heure saisissable + liste de créneaux) et `DateTimePicker`.
- Calendrier : dates et heures de l'événement via `DatePicker` / `TimePicker`, saisie directe d'une date dans le sélecteur de période.
- `Modal` : Entrée dans un `<textarea>` n'envoie plus la modale.
- `Sidebar` : prop `legalLinks` (pied de page unifié, « Volcanium » vers https://volcanium.eu), plus de lien englobant tout le pied.
- Aperçu de fichiers : `FilePreviewModal`, `FilePreviewStrip`, `MessageAttachments`, `canPreviewMime` ; `FilePicker` (`previewFiles`) et `MessageComposer` (`attachments`) affichent les fichiers en attente.


## Licence / License
MIT © 2026 [Volcanium Studio](https://volcanium.eu). Vous pouvez cloner, modifier et utiliser cette bibliothèque, y compris à des fins commerciales, à condition de **mentionner l'auteur original : Volcanium Studio et volcanium.eu** (conservez le fichier `LICENSE` ou l'avis de copyright dans vos copies). / You may clone, modify and use this library, including commercially, provided you **credit the original author: Volcanium Studio and volcanium.eu** (keep the `LICENSE` file or copyright notice in your copies).
