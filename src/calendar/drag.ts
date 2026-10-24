import type { CalEvent } from "./types";
import type { Span } from "./time";

/** Evenement en cours de deplacement a la souris : lui, son intervalle, et ou on l'a saisi (pixels depuis le haut de la pastille). */
export interface DragState { event: CalEvent; span: Span; grabPx: number }
export type DragRef = { current: DragState | null };

export function startDrag(e: React.DragEvent<HTMLElement>, ref: DragRef, event: CalEvent, span: Span): void {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", event.id); // Firefox exige une donnee pour demarrer le glisser-deposer
  ref.current = { event, span, grabPx: e.clientY - e.currentTarget.getBoundingClientRect().top };
}

const HOLD_MS = 350; // appui long avant que le doigt n'emporte l'evenement (sinon c'est un defilement)
const SLOP = 8; // px de tolerance pendant l'appui long
let touching = false;
// Ecouteur NON passif, pose une seule fois : pendant un deplacement au doigt la page ne doit pas defiler (iOS exige qu'il soit pose avant le toucher).
if (typeof document !== "undefined") document.addEventListener("touchmove", (ev) => { if (touching && ev.cancelable) ev.preventDefault(); }, { passive: false });

/**
 * Deplacement au doigt (ou au stylet) : appui long sur la pastille, puis glisser. La souris garde le glisser-deposer natif.
 * `onMove`/`onDrop` recoivent la position ecran du doigt ; `onEnd` est toujours appele (depot, annulation, defilement).
 */
export function startTouchDrag(e: React.PointerEvent<HTMLElement>, cb: { onStart?: () => void; onMove: (x: number, y: number) => void; onDrop: (x: number, y: number) => void; onEnd: () => void }): void {
  if (e.pointerType === "mouse" || !e.isPrimary) return;
  const el = e.currentTarget;
  const id = e.pointerId;
  const box = el.getBoundingClientRect();
  const offX = e.clientX - box.left, offY = e.clientY - box.top;
  const startX = e.clientX, startY = e.clientY;
  let active = false;
  let ghost: HTMLElement | null = null;
  const place = (x: number, y: number) => { if (ghost) ghost.style.transform = `translate(${x - offX}px, ${y - offY}px)`; };
  const timer = window.setTimeout(() => {
    active = true; touching = true;
    navigator.vibrate?.(12);
    ghost = el.cloneNode(true) as HTMLElement;
    Object.assign(ghost.style, { position: "fixed", left: "0", top: "0", width: `${box.width}px`, height: `${box.height}px`, margin: "0", zIndex: "9999", pointerEvents: "none", opacity: "0.85", boxShadow: "0 4px 14px rgb(0 0 0 / .35)" });
    document.body.appendChild(ghost);
    place(startX, startY);
    cb.onStart?.();
  }, HOLD_MS);
  const noMenu = (ev: Event) => ev.preventDefault();
  const swallowClick = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); };
  const end = (dropped: boolean) => {
    window.clearTimeout(timer);
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    document.removeEventListener("pointercancel", cancel);
    el.removeEventListener("contextmenu", noMenu);
    ghost?.remove(); ghost = null;
    touching = false;
    if (active) {
      // le « clic » qui suit le relachement ne doit pas ouvrir l'evenement
      document.addEventListener("click", swallowClick, { capture: true, once: true });
      window.setTimeout(() => document.removeEventListener("click", swallowClick, { capture: true }), 400);
    }
    if (active) cb.onEnd();
    void dropped;
  };
  function move(ev: PointerEvent) {
    if (ev.pointerId !== id) return;
    if (!active) { if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > SLOP) end(false); return; }
    place(ev.clientX, ev.clientY);
    cb.onMove(ev.clientX, ev.clientY);
  }
  function up(ev: PointerEvent) {
    if (ev.pointerId !== id) return;
    const was = active;
    if (was) cb.onDrop(ev.clientX, ev.clientY);
    end(true);
  }
  function cancel(ev: PointerEvent) { if (ev.pointerId === id) end(false); }
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
  document.addEventListener("pointercancel", cancel);
  el.addEventListener("contextmenu", noMenu);
}

/** Jour (`YYYY-MM-DD`) de la case sous le doigt, parmi les elements portant l'attribut `data-<attr>`. */
export const cellAt = (x: number, y: number, attr: string): HTMLElement | null => document.elementFromPoint(x, y)?.closest<HTMLElement>(`[data-${attr}]`) ?? null;
