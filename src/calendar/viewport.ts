import { useSyncExternalStore } from "react";

// Point de rupture « telephone » : le meme que le tiroir du `Sidebar` de la bibliotheque (`sm` = 640 px), pour que les deux changent ensemble.
const PHONE = "(max-width: 639px)";
// Ecran tactile sans souris : pas de survol, pas de clic droit.
const TOUCH = "(hover: none) and (pointer: coarse)";

function mediaHook(query: string) {
  const subscribe = (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
  const snapshot = () => window.matchMedia(query).matches;
  return () => useSyncExternalStore(subscribe, snapshot, () => false);
}

/** Mise en page « application mobile » (pile d'ecrans, barre d'onglets en bas). */
export const useIsMobile = mediaHook(PHONE);
/** L'appareil n'a pas de survol : les actions cachees au survol doivent etre atteignables autrement. */
export const useIsTouch = mediaHook(TOUCH);

/** Ecran « court » ou etroit (telephone en portrait comme en paysage) : le calendrier y defile au lieu de tout afficher d'un coup. */
export const useIsCompactCalendar = mediaHook("(max-width: 639px), (max-height: 500px)");
/** Ecran bas (telephone en paysage) : la hauteur est precieuse, la barre laterale se replie en rail. */
export const useIsShort = mediaHook("(max-height: 500px)");
/** Tablette (et petit portable) : la barre laterale demarre repliee en rail, pour laisser la place au contenu. */
export const useIsTablet = mediaHook("(max-width: 1023px)");
