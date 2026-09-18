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
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [triggerRef, panelRef, onOutsideClick]);
}
