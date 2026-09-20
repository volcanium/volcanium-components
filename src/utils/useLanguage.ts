import { useVolcaniumConfig } from "../components/config/VolcaniumProvider";

export type TranslationKey =
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
  | "table_filter_all"
  | "table_filter_yes"
  | "table_filter_no"
  | "table_filter_placeholder"
  | "table_add"
  | "stepper_empty_cursus"
  | "stepper_empty_roadmap"
  | "stepper_done";

type Dictionary = Record<TranslationKey, string>;

const dictionaries: Record<"fr" | "en", Dictionary> = {
  fr: {
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
    table_filter_all: "Tous",
    table_filter_yes: "Oui",
    table_filter_no: "Non",
    table_filter_placeholder: "Filtrer...",
    table_add: "Ajouter",
    stepper_empty_cursus: "Aucune étape n'a été ajoutée au cursus.",
    stepper_empty_roadmap: "Aucune étape n'a été ajoutée à la roadmap.",
    stepper_done: "Fait",
  },
  en: {
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
    table_filter_all: "All",
    table_filter_yes: "Yes",
    table_filter_no: "No",
    table_filter_placeholder: "Filter...",
    table_add: "Add",
    stepper_empty_cursus: "No step has been added to the cursus yet.",
    stepper_empty_roadmap: "No step has been added to the roadmap yet.",
    stepper_done: "Done",
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
