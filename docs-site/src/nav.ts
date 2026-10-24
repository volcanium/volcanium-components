export interface NavEntry {
  path: string;
  label: string;
}

export interface NavGroup {
  group: string;
  items: NavEntry[];
}

export const navGroups: NavGroup[] = [
  {
    group: "Configuration",
    items: [
      { path: "/config/volcanium-provider", label: "VolcaniumProvider" },
      { path: "/ui/theme-toggle", label: "ThemeToggle" },
    ],
  },
  {
    group: "Actions",
    items: [
      { path: "/ui/button", label: "Button" },
      { path: "/ui/tooltip-button", label: "TooltipButton" },
      { path: "/ui/link", label: "Link" },
    ],
  },
  {
    group: "Formulaires et saisie",
    items: [
      { path: "/ui/input", label: "Input" },
      { path: "/ui/textarea", label: "Textarea" },
      { path: "/ui/select", label: "Select" },
      { path: "/ui/toggle", label: "Toggle" },
      { path: "/ui/date-picker", label: "DatePicker" },
      { path: "/ui/form", label: "Form" },
    ],
  },
  {
    group: "Retours et fenêtres",
    items: [
      { path: "/ui/modal", label: "Modal" },
      { path: "/ui/confirm-modal", label: "ConfirmModal / PromptModal" },
      { path: "/ui/toast", label: "ToastProvider / notify" },
      { path: "/ui/loader", label: "Loader" },
      { path: "/ui/full-page-loader", label: "FullPageLoader" },
      { path: "/ui/information-button", label: "InformationButton" },
      { path: "/ui/in-dev", label: "InDev" },
    ],
  },
  {
    group: "Affichage des données",
    items: [
      { path: "/ui/table", label: "Table" },
      { path: "/ui/check-list-item", label: "CheckListItem" },
      { path: "/ui/stepper", label: "Stepper" },
      { path: "/ui/tabs", label: "Tabs" },
      { path: "/ui/info-card", label: "InfoCard / InfoGrid" },
    ],
  },
  {
    group: "Contenu",
    items: [
      { path: "/ui/title", label: "Title" },
      { path: "/ui/container", label: "Container" },
    ],
  },
  {
    group: "Mise en page",
    items: [
      { path: "/layout/center", label: "Center" },
      { path: "/layout/grid", label: "Grid" },
      { path: "/layout/top-nav", label: "TopNav" },
      { path: "/layout/sidebar", label: "Sidebar" },
      { path: "/layout/hero", label: "Hero" },
      { path: "/layout/nav", label: "Nav" },
    ],
  },
];
