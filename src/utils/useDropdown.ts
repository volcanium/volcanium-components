import { RefObject, useEffect } from "react";

/** Closes a dropdown when clicking outside both `triggerRef` and (optionally) `panelRef`. */
export function useClickOutside<T extends HTMLElement, P extends HTMLElement = HTMLElement>(
  triggerRef: RefObject<T | null>,
  panelRef: RefObject<P | null> | undefined,
  onOutsideClick: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePanel = panelRef?.current?.contains(target);
      if (!insideTrigger && !insidePanel) onOutsideClick();
    };
    // Capture phase: a dropdown opened from inside a `Modal` (whose dialog
    // stops click propagation to avoid closing on inside-clicks) would
    // otherwise never see clicks elsewhere in that same dialog.
    window.addEventListener("click", handler, true);
    return () => window.removeEventListener("click", handler, true);
  }, [triggerRef, panelRef, onOutsideClick]);
}
