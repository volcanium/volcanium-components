/** Requête média du mode téléphone : même seuil que le point de rupture `sm` de Tailwind (640 px). */
export const MOBILE_QUERY = "(max-width: 639px)";

/** Vrai quand la fenêtre fait moins de 640 px de large (téléphone). Toujours faux côté serveur. */
export function isMobileViewport(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(MOBILE_QUERY).matches;
}
