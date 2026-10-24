import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./ui";
import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react";
import { useI18n } from "./host";

const MARGIN = 8;

interface Props {
  /** Nom du bouton (info-bulle) ; `title` : titre de la bulle. */
  label: string;
  title: string;
  /** Nombre de criteres actifs, affiche en pastille sur le bouton. */
  count: number;
  children: ReactNode;
}

/**
 * Bouton + bulle ancree a sa droite (comme la fiche de profil) : elle recouvre la page au lieu de pousser la liste vers le bas. Rendue dans
 * `document.body`, repositionnee au defilement, fermee par Echap ou un clic dehors (un clic dans une liste deroulante du registre n'est pas « dehors »).
 * Sert au tri des contacts.
 */
export default function FilterPopover({ label, title, count, children }: Props) {
  const { t } = useI18n();
  const trigger = useRef<HTMLSpanElement>(null);
  const card = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<{ left: number; top: number } | null>(null);

  const reposition = useCallback(() => {
    const t = trigger.current?.getBoundingClientRect();
    const c = card.current;
    if (!t || !c) return;
    setPlace({
      left: Math.max(MARGIN, Math.min(t.right + MARGIN, window.innerWidth - c.offsetWidth - MARGIN)),
      top: Math.max(MARGIN, Math.min(t.top, window.innerHeight - c.offsetHeight - MARGIN)),
    });
  }, []);
  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);
  useEffect(() => {
    if (!open) return undefined;
    const close = () => { setOpen(false); setPlace(null); };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element;
      if (!card.current?.contains(target) && !trigger.current?.contains(target) && !target.closest('[role="listbox"]')) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.querySelector('[role="listbox"]')) close(); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, reposition]);

  return (
    <>
      <span ref={trigger} className="relative shrink-0">
        <IconButton label={label} aria-expanded={open} onClick={() => { setOpen((v) => !v); setPlace(null); }}><IconAdjustmentsHorizontal size={18} /></IconButton>
        {count > 0 && <span aria-hidden className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-vc-main px-1 text-[10px] font-semibold text-white">{count}</span>}
      </span>
      {open && createPortal(
        <section
          ref={card}
          role="dialog"
          aria-label={title}
          style={{ left: place?.left ?? 0, top: place?.top ?? 0, visibility: place ? "visible" : "hidden" }}
          className="fixed z-50 flex max-h-[calc(100dvh-1rem)] w-[24rem] max-w-[calc(100vw-1rem)] flex-col gap-3 overflow-y-auto rounded-xl border border-vc-line-strong bg-vc-container p-4 text-vc-text shadow-2xl max-sm:bottom-0 max-sm:left-0! max-sm:top-auto! max-sm:max-h-[85dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{title}</h2>
            <button type="button" onClick={() => { setOpen(false); setPlace(null); }} aria-label={t("contacts.close")} className="cursor-pointer rounded-full p-1 text-vc-text/60 hover:bg-vc-veil hover:text-vc-text"><IconX size={16} aria-hidden /></button>
          </div>
          {children}
        </section>,
        document.body,
      )}
    </>
  );
}
