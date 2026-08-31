// This is a minimal translation mock to keep the UI components independent
// while retaining compatibility with the old interface.

export function useLanguage() {
  return {
    t: (key: string) => {
      const translations: Record<string, string> = {
        not_provided: "Non renseigné",
        account: "Compte",
        cancel: "Annuler",
        confirm: "Confirmer",
        select_search_placeholder: "Rechercher...",
        select_loading: "Chargement...",
        select_no_results: "Aucun résultat"
      };
      return translations[key] || key;
    },
    language: "fr",
    setLanguage: (lang: string) => {}
  };
}
