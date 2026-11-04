import { useEffect } from "react";

/** Appelle `action` quand `targetKey` est relâchée (écouteur sur `window`). L'événement est transmis pour filtrer au besoin (ex. ignorer Entrée dans un `<textarea>`). */
export default function useKeyPress(targetKey: string, action: (e: KeyboardEvent) => void) {
  useEffect(() => {
    function onKeyup(e: KeyboardEvent) {
      if (e.key === targetKey) action(e);
    }
    window.addEventListener("keyup", onKeyup);
    return () => window.removeEventListener("keyup", onKeyup);
  }, [action, targetKey]);
}
