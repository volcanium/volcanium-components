import { useEffect } from "react";

export default function useKeyPress(targetKey: string, action: () => void) {
  useEffect(() => {
    function onKeyup(e: KeyboardEvent) {
      if (e.key === targetKey) action();
    }
    window.addEventListener("keyup", onKeyup);
    return () => window.removeEventListener("keyup", onKeyup);
  }, [action, targetKey]);
}
