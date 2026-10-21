import { useVolcaniumConfig } from "../components/config/VolcaniumProvider";

export type TranslationKey =
  | "rte_toolbar"
  | "rte_bold"
  | "rte_italic"
  | "rte_underline"
  | "rte_bullet_list"
  | "rte_ordered_list"
  | "rte_link"
  | "rte_link_label"
  | "rte_link_placeholder"
  | "rte_undo"
  | "rte_redo"
  | "not_provided"
  | "account"
  | "cancel"
  | "confirm"
  | "close"
  | "select_placeholder"
  | "select_search_placeholder"
  | "select_loading"
  | "select_no_results"
  | "feature_not_available"
  | "feature_in_development"
  | "table_search_placeholder"
  | "table_no_results"
  | "table_confirmation"
  | "table_delete_confirm_one"
  | "table_delete_confirm_many"
  | "table_selected_one"
  | "table_selected_many"
  | "table_open"
  | "table_delete_selection"
  | "table_copy_selection"
  | "table_paste_selection"
  | "table_reload"
  | "table_undo"
  | "table_redo"
  | "table_edit_cell"
  | "table_previous_page"
  | "table_next_page"
  | "table_results"
  | "table_page"
  | "table_generic_error"
  | "table_network_error"
  | "table_unexpected_error"
  | "table_internal_error"
  | "table_show_filters"
  | "table_hide_filters"
  | "table_filter"
  | "table_filter_reset"
  | "table_filter_all"
  | "table_filter_yes"
  | "table_filter_no"
  | "table_filter_placeholder"
  | "table_add"
  | "stepper_empty_cursus"
  | "stepper_empty_roadmap"
  | "stepper_done"
  | "action_failed"
  | "save_failed"
  | "validate"
  | "click_to_edit"
  | "hint_enter_validate"
  | "hint_ctrl_enter_validate"
  | "hint_escape_cancel"
  | "switch_to_dark"
  | "switch_to_light"
  | "hide_password"
  | "show_password"
  | "collapse_menu"
  | "expand_menu"
  | "open_menu"
  | "open_account_menu"
  | "switch_account"
  | "manage_account"
  | "logout"
  | "accounts"
  | "apps"
  | "switch_app"
  | "add_account"
  | "remove_account"
  | "previous_month"
  | "next_month"
  | "open_calendar"
  | "confirm_retype"
  | "presence_label"
  | "presence_online"
  | "presence_offline"
  | "presence_idle"
  | "presence_in_call"
  | "presence_dnd";

type Dictionary = Record<TranslationKey, string>;

const dictionaries: Record<"fr" | "en", Dictionary> = {
  fr: {
    rte_toolbar: "Mise en forme",
    rte_bold: "Gras",
    rte_italic: "Italique",
    rte_underline: "Souligné",
    rte_bullet_list: "Liste à puces",
    rte_ordered_list: "Liste numérotée",
    rte_link: "Lien",
    rte_link_label: "Adresse du lien",
    rte_link_placeholder: "https://…",
    rte_undo: "Annuler la dernière modification",
    rte_redo: "Rétablir",
    not_provided: "Non renseigné",
    account: "Compte",
    cancel: "Annuler",
    confirm: "Confirmer",
    close: "Fermer",
    select_placeholder: "Sélectionner...",
    select_search_placeholder: "Rechercher...",
    select_loading: "Chargement...",
    select_no_results: "Aucun résultat",
    feature_not_available: "Fonctionnalité non disponible",
    feature_in_development: "Cette fonctionnalité est en cours de développement.",
    table_search_placeholder: "Rechercher...",
    table_no_results: "Aucun résultat",
    table_confirmation: "Confirmation",
    table_delete_confirm_one: "Êtes-vous sûr de vouloir supprimer {count} ligne ?",
    table_delete_confirm_many: "Êtes-vous sûr de vouloir supprimer {count} lignes ?",
    table_selected_one: "{count} sélectionné",
    table_selected_many: "{count} sélectionnés",
    table_open: "Ouvrir",
    table_delete_selection: "Supprimer la sélection",
    table_copy_selection: "Copier la sélection",
    table_paste_selection: "Coller la sélection",
    table_reload: "Recharger",
    table_undo: "Annuler",
    table_redo: "Rétablir",
    table_edit_cell: "Éditer la cellule",
    table_previous_page: "Page précédente",
    table_next_page: "Page suivante",
    table_results: "{count} résultat{plural} — page {page} / {totalPages}",
    table_page: "page",
    table_generic_error: "Une erreur inconnue est survenue.",
    table_network_error: "Erreur réseau ou serveur : {message}",
    table_unexpected_error: "Une erreur inattendue est survenue.",
    table_internal_error: "Erreur interne",
    table_show_filters: "Afficher les filtres",
    table_hide_filters: "Masquer les filtres",
    table_filter: "Filtrer",
    table_filter_reset: "Réinitialiser",
    table_filter_all: "Tous",
    table_filter_yes: "Oui",
    table_filter_no: "Non",
    table_filter_placeholder: "Filtrer...",
    table_add: "Ajouter",
    stepper_empty_cursus: "Aucune étape n'a été ajoutée au cursus.",
    stepper_empty_roadmap: "Aucune étape n'a été ajoutée à la roadmap.",
    stepper_done: "Fait",
    action_failed: "Action impossible",
    save_failed: "Enregistrement impossible",
    validate: "Valider",
    click_to_edit: "Cliquer pour modifier",
    hint_enter_validate: "Entrée pour valider",
    hint_ctrl_enter_validate: "Ctrl+Entrée pour valider",
    hint_escape_cancel: "Échap pour annuler",
    switch_to_dark: "Passer en thème sombre",
    switch_to_light: "Passer en thème clair",
    hide_password: "Masquer le mot de passe",
    show_password: "Afficher le mot de passe",
    collapse_menu: "Réduire le menu",
    expand_menu: "Déplier le menu",
    open_menu: "Ouvrir le menu",
    open_account_menu: "Ouvrir le menu du compte",
    switch_account: "Changer de compte",
    manage_account: "Gérer mon compte",
    logout: "Se déconnecter",
    accounts: "Comptes",
    apps: "Applications",
    switch_app: "Changer d'application",
    add_account: "Ajouter un compte",
    remove_account: "Retirer ce compte",
    previous_month: "Mois précédent",
    next_month: "Mois suivant",
    open_calendar: "Ouvrir le calendrier",
    confirm_retype: "Pour confirmer, recopiez : {text}",
    presence_label: "Statut",
    presence_online: "En ligne",
    presence_offline: "Hors ligne",
    presence_idle: "Inactif",
    presence_in_call: "En appel",
    presence_dnd: "Ne pas déranger",
  },
  en: {
    rte_toolbar: "Formatting",
    rte_bold: "Bold",
    rte_italic: "Italic",
    rte_underline: "Underline",
    rte_bullet_list: "Bulleted list",
    rte_ordered_list: "Numbered list",
    rte_link: "Link",
    rte_link_label: "Link address",
    rte_link_placeholder: "https://…",
    rte_undo: "Undo",
    rte_redo: "Redo",
    not_provided: "Not provided",
    account: "Account",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    select_placeholder: "Select...",
    select_search_placeholder: "Search...",
    select_loading: "Loading...",
    select_no_results: "No results",
    feature_not_available: "Feature not available",
    feature_in_development: "This feature is currently under development.",
    table_search_placeholder: "Search...",
    table_no_results: "No results",
    table_confirmation: "Confirmation",
    table_delete_confirm_one: "Are you sure you want to delete {count} row?",
    table_delete_confirm_many: "Are you sure you want to delete {count} rows?",
    table_selected_one: "{count} selected",
    table_selected_many: "{count} selected",
    table_open: "Open",
    table_delete_selection: "Delete selection",
    table_copy_selection: "Copy selection",
    table_paste_selection: "Paste selection",
    table_reload: "Reload",
    table_undo: "Undo",
    table_redo: "Redo",
    table_edit_cell: "Edit cell",
    table_previous_page: "Previous page",
    table_next_page: "Next page",
    table_results: "{count} result{plural} — page {page} / {totalPages}",
    table_page: "page",
    table_generic_error: "An unknown error occurred.",
    table_network_error: "Network or server error: {message}",
    table_unexpected_error: "An unexpected error occurred.",
    table_internal_error: "Internal error",
    table_show_filters: "Show filters",
    table_hide_filters: "Hide filters",
    table_filter: "Filter",
    table_filter_reset: "Reset",
    table_filter_all: "All",
    table_filter_yes: "Yes",
    table_filter_no: "No",
    table_filter_placeholder: "Filter...",
    table_add: "Add",
    stepper_empty_cursus: "No step has been added to the cursus yet.",
    stepper_empty_roadmap: "No step has been added to the roadmap yet.",
    stepper_done: "Done",
    action_failed: "Action failed",
    save_failed: "Could not save",
    validate: "Validate",
    click_to_edit: "Click to edit",
    hint_enter_validate: "Enter to validate",
    hint_ctrl_enter_validate: "Ctrl+Enter to validate",
    hint_escape_cancel: "Esc to cancel",
    switch_to_dark: "Switch to dark theme",
    switch_to_light: "Switch to light theme",
    hide_password: "Hide password",
    show_password: "Show password",
    collapse_menu: "Collapse menu",
    expand_menu: "Expand menu",
    open_menu: "Open menu",
    open_account_menu: "Open account menu",
    switch_account: "Switch account",
    manage_account: "Manage my account",
    logout: "Log out",
    accounts: "Accounts",
    apps: "Applications",
    switch_app: "Switch application",
    add_account: "Add an account",
    remove_account: "Remove this account",
    previous_month: "Previous month",
    next_month: "Next month",
    open_calendar: "Open calendar",
    confirm_retype: "To confirm, type: {text}",
    presence_label: "Status",
    presence_online: "Online",
    presence_offline: "Offline",
    presence_idle: "Idle",
    presence_in_call: "In a call",
    presence_dnd: "Do not disturb",
  },
};

function resolveDictionary(language: string): Dictionary {
  return dictionaries[language as "fr" | "en"] || dictionaries.en;
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Reads/writes the language stored in `VolcaniumProvider`. Must be used
 * within a `VolcaniumProvider` — it drives real, shared state (not a mock):
 * `setLanguage` updates the provider's context and re-renders every consumer.
 */
export function useLanguage() {
  const { language, setLanguage } = useVolcaniumConfig();
  const dictionary = resolveDictionary(language);

  const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
    interpolate(dictionary[key] ?? key, vars);

  return { t, language, setLanguage };
}
