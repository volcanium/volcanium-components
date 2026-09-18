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
    group: "Config",
    items: [{ path: "/config/volcanium-provider", label: "VolcaniumProvider" }],
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
    group: "Forms & Inputs",
    items: [
      { path: "/ui/input", label: "Input" },
      { path: "/ui/textarea", label: "Textarea" },
      { path: "/ui/select", label: "Select" },
      { path: "/ui/toggle", label: "Toggle" },
      { path: "/ui/form", label: "Form" },
    ],
  },
  {
    group: "Feedback & Overlays",
    items: [
      { path: "/ui/modal", label: "Modal" },
      { path: "/ui/toast", label: "ToastProvider / notify" },
      { path: "/ui/loader", label: "Loader" },
      { path: "/ui/information-button", label: "InformationButton" },
      { path: "/ui/in-dev", label: "InDev" },
    ],
  },
  {
    group: "Data Display",
    items: [
      { path: "/ui/table", label: "Table" },
      { path: "/ui/check-list-item", label: "CheckListItem" },
      { path: "/ui/stepper", label: "Stepper" },
    ],
  },
  {
    group: "Content",
    items: [
      { path: "/ui/title", label: "Title" },
      { path: "/ui/container", label: "Container" },
    ],
  },
  {
    group: "Layout",
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
