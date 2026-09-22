import { ReactNode, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface TooltipButtonProps {
  children: ReactNode;
  tooltip: ReactNode;
}

interface Position {
  left: number;
  top?: number;
  bottom?: number;
  openDown: boolean;
}

/**
 * A hover/focus tooltip, portaled to `document.body` instead of rendered
 * inline. Table.tsx's toolbar buttons (undo/redo/filter/reload/add) sit
 * right at the top edge of a `Squircle`-clipped card - an inline tooltip
 * opening upward (the old default) got its top sliced off by that clip-path,
 * since a squircle's corners are a hard geometric boundary, not a
 * `overflow: hidden` a child could still be caught by only near its edges.
 * Portaling escapes that entirely, and flips to open downward on its own
 * when there isn't enough room above the trigger (e.g. the very first row of
 * controls in a table card).
 */
export default function TooltipButton({ children, tooltip }: TooltipButtonProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  useLayoutEffect(() => {
    if (!visible) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      const spaceAbove = rect.top;
      const openDown = spaceAbove < 48;
      setPosition({
        left: rect.left + rect.width / 2,
        top: openDown ? rect.bottom + margin : undefined,
        bottom: openDown ? undefined : window.innerHeight - rect.top + margin,
        openDown,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      tabIndex={0}
      aria-describedby={tooltipId}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <div>{children}</div>

      {position &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{
              position: "fixed",
              left: position.left,
              top: position.top,
              bottom: position.bottom,
              transform: "translateX(-50%)",
            }}
            className={`z-999 border border-vc-secondary/40 bg-vc-container text-white text-sm rounded-md px-3 py-1 text-center pointer-events-none
                        whitespace-nowrap max-w-max transition-opacity duration-150 ease-out ${
                          visible ? "opacity-100" : "opacity-0"
                        }`}
          >
            {tooltip}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-l-transparent border-r-transparent ${
                position.openDown
                  ? "bottom-full border-b-6 border-b-vc-secondary/40"
                  : "top-full border-t-6 border-t-vc-secondary/40"
              }`}
            ></div>
          </div>,
          document.body,
        )}
    </div>
  );
}
