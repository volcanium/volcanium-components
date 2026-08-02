# Guide de Contribution & Architecture - Volcanium Components

Ce document définit les règles strictes d'architecture et de conception pour maintenir la cohérence de la librairie de composants. Toute modification ou création de composant doit respecter ces conventions.

## 1. Design System & Typographie (Tailwind CSS)
- **Couleurs sémantiques** : N'utilisez **jamais** de couleurs Tailwind par défaut (ex: `bg-red-500`, `text-blue-300`) ou de codes hexadécimaux codés en dur. Vous devez obligatoirement utiliser le thème défini dans `src/index.css` :
  - `bg-main`, `text-main`
  - `bg-back` (fond principal), `bg-contaner` (fonds de cartes/modales)
  - `text-secondary`, `text-text`
- **Polices** : Utilisez les classes `font-main`, `font-title` et `font-secondary`.
- **Comportements globaux** : L'utilisation de classes arbitraires doit rester exceptionnelle.

## 2. Iconographie
- L'intégralité des icônes du projet doit provenir exclusivement de la librairie `@tabler/icons-react`.
- Les icônes doivent toujours hériter de la couleur du texte parent (`stroke="currentColor"`) à moins d'une exception justifiée.

## 3. Structure et Typage (TypeScript)
- **Bannir `any`** : Chaque composant doit avoir une interface `Props` explicite. Cela garantit l'auto-complétion et évite les erreurs de typage dans l'application hôte.
- **Indépendance des composants** : Un composant de layout (ex: `Sidebar`) ne doit pas forcer son comportement via un composant global (ex: `Button`) si cela crée un conflit de styles.
- **Exportation** : Tout nouveau composant doit être ajouté au fichier `src/index.ts` pour être accessible.

## 4. Notifications & Interactions
- **Alertes natives interdites** : Ne jamais utiliser `alert()`, `window.confirm()` ou `console.log` pour interagir avec l'utilisateur.
- Utilisez systématiquement l'utilitaire interne `notify` (`notify.success`, `notify.info`, `notify.error` depuis `src/components/ui/notify.ts`).
- Assurez-vous que `<ToastProvider>` englobe l'application ou l'environnement de test (Storybook) pour que les notifications fonctionnent.

## 5. Storybook & Documentation
- Chaque composant doit posséder son propre fichier `.stories.tsx`.
- Les données utilisées dans Storybook doivent simuler un environnement réel (textes fictifs, routes simulées via `useLocation`, conteneurs adaptés) pour garantir un aperçu fidèle au rendu final.
