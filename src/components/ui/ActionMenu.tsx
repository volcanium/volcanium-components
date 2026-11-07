import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconDots } from "@tabler/icons-react";
import clsx from "clsx";
import IconButton from "./IconButton";

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  /** Action destructive (rouge). */
  danger?: boolean;
  /** Filet au-dessus (sépare un groupe d'actions). */
  separatorBefore?: boolean;
  onSelect: () => void;
}

export interface ActionMenuProps {
  /** Nom accessible du bouton « … » (ex. « Actions »). */
  label: string;
  actions: ActionMenuItem[];
  /** Ouvre le menu de l'extérieur (ex. clic droit sur la ligne). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Bouton « … » qui ouvre un menu d'actions (une ligne de liste, une carte) : flèches, Entrée, Échap, fermeture au clic extérieur.
 * Pour CHOISIR une valeur dans une liste, utiliser `Select`.
 */
export default function ActionMenu({ label, actions, open: openProp, onOpenChange, className }: ActionMenuProps) {
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const setOpen = (o: boolean) => { setInner(o); onOpenChange?.(o); };
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!open || !btn.current || !menu.current) return;
    const b = btn.current.getBoundingClientRect();
    const m = menu.current.getBoundingClientRect();
    setPos({ x: Math.max(8, Math.min(b.right - m.width, window.innerWidth - m.width - 8)), y: Math.max(8, Math.min(b.bottom + 4, window.innerHeight - m.height - 8)) });
    menu.current.querySelector<HTMLButtonElement>("button")?.focus();
  }, [open, btn]);

  useEffect(() => {
    if (!open) return;
    const close = () => { setInner(false); onOpenChange?.(false); };
    const away = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) close(); };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); btn.current?.focus(); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        const i = items.indexOf(document.activeElement as HTMLButtonElement);
        items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      }
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", key); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <IconButton ref={btn} size="sm" label={label} className={className} aria-haspopup="menu" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        <IconDots size={16} />
      </IconButton>
      {open && createPortal(
        <ul ref={menu} role="menu" aria-label={label} style={{ left: pos.x, top: pos.y }} className="fixed z-50 w-56 rounded-lg border border-vc-line bg-vc-container py-1 text-sm shadow-xl">
          {actions.map((a) => (
            <li key={a.key} role="none" className={clsx(a.separatorBefore && "mt-1 border-t border-vc-line pt-1")}>
              <button type="button" role="menuitem" onClick={() => { setOpen(false); a.onSelect(); }} className={clsx("flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left hover:bg-vc-veil-strong focus-visible:bg-vc-veil-strong focus-visible:outline-none", a.danger && "text-vc-danger")}>
                {a.icon && <span className="shrink-0 opacity-80">{a.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{a.label}</span>
              </button>
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  );
}
