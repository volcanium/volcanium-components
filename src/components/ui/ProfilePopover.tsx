import { ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import Avatar from "./Avatar";
import Tabs, { TabItem } from "./Tabs";
import { useLanguage } from "../../utils/useLanguage";

/** Onglet de la fiche. Son `content` peut être une fonction recevant `goTo` (bouton « Afficher plus » qui ouvre un autre onglet). */
export interface ProfileTab extends Omit<TabItem, "content"> {
  content: ReactNode | ((nav: { goTo: (tabId: string) => void }) => ReactNode);
}

export interface ProfilePopoverProps {
  /** Ce sur quoi on clique pour ouvrir la fiche (un nom, une adresse, une photo). Rendu dans un `<button>`. */
  children: ReactNode;
  /** Nom affiché en titre. */
  name: string;
  /** Adresse e-mail, affichée sous le nom. */
  email?: string;
  /** URL de la photo de profil ; à défaut, les initiales. */
  avatarSrc?: string | null;
  /** Étiquette à côté du nom (« Externe », « Interne »…), par exemple un `<Tag>`. */
  tag?: ReactNode;
  /** Courte description (poste, bio) : n'est affichée que si elle est fournie. */
  bio?: ReactNode;
  /** Boutons d'action sous le nom (écrire, appeler…). */
  actions?: ReactNode;
  /** Onglets de la fiche (Vue d'ensemble, Contact, Fichiers, Messages…). Un seul onglet : la barre n'est pas affichée. */
  tabs: ProfileTab[];
  /** Onglet affiché à l'ouverture. @default premier onglet */
  defaultTab?: string;
  /** Appelé à l'ouverture et à la fermeture : c'est ici que l'hôte charge les données de la fiche. */
  onOpenChange?: (open: boolean) => void;
  /** Classes du bouton déclencheur. */
  triggerClassName?: string;
  /** Texte alternatif du bouton déclencheur (sinon son contenu). */
  triggerLabel?: string;
}

interface Placement { left: number; top: number }
const MARGIN = 8;

/**
 * Fiche de profil façon Microsoft 365, affichée en info-bulle SOUS l'élément cliqué (jamais en modale) : photo, nom, étiquette,
 * actions et onglets. Rendue dans `document.body` (pas coupée par un conteneur), repositionnée au défilement, passe au-dessus
 * si elle manque de place en dessous, se ferme avec Échap, un clic à l'extérieur ou la croix.
 * @see {@link https://vcomponents.tmenv.fr/?path=/docs/ui-profilepopover--docs}
 */
export default function ProfilePopover({ children, name, email, avatarSrc, tag, bio, actions, tabs, defaultTab, onOpenChange, triggerClassName = "", triggerLabel }: ProfilePopoverProps) {
  const { t } = useLanguage();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<Placement | null>(null);
  const [tab, setTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const change = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setPlace(null);
    onOpenChange?.(next);
  }, [onOpenChange]);

  const reposition = useCallback(() => {
    const t = trigger.current?.getBoundingClientRect();
    const c = card.current;
    if (!t || !c) return;
    const width = c.offsetWidth;
    const height = c.offsetHeight;
    const below = window.innerHeight - t.bottom - MARGIN;
    const above = t.top - MARGIN;
    const openUp = height > below && above > below;
    setPlace({
      left: Math.max(MARGIN, Math.min(t.left, window.innerWidth - width - MARGIN)),
      top: openUp ? Math.max(MARGIN, t.top - height - MARGIN) : t.bottom + MARGIN,
    });
  }, []);

  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition, tab, tabs]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!card.current?.contains(target) && !trigger.current?.contains(target)) change(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { change(false); trigger.current?.focus(); }
    };
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
  }, [open, change, reposition]);

  const active = tabs.find((x) => x.id === tab) ?? tabs[0];

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={triggerLabel}
        onClick={(e) => { e.stopPropagation(); change(!open); }}
        className={`cursor-pointer rounded text-left hover:underline focus-visible:outline-2 focus-visible:outline-vc-main ${triggerClassName}`}
      >
        {children}
      </button>
      {open && createPortal(
        <div
          ref={card}
          id={id}
          role="dialog"
          aria-label={name}
          style={{ left: place?.left ?? 0, top: place?.top ?? 0, visibility: place ? "visible" : "hidden" }}
          className="fixed z-50 flex max-h-[min(36rem,calc(100dvh-1rem))] w-[26rem] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-vc-line-strong bg-vc-container text-vc-text shadow-2xl"
        >
          <button type="button" onClick={() => { change(false); trigger.current?.focus(); }} aria-label={t("close")} className="absolute right-2 top-2 cursor-pointer rounded-full p-1 text-vc-text/60 hover:bg-vc-veil hover:text-vc-text">
            <IconX size={16} aria-hidden />
          </button>
          <div className="flex items-start gap-4 p-4 pb-3 pr-10">
            <Avatar name={name} {...(email ? { email } : {})} src={avatarSrc ?? null} size={72} />
            <div className="min-w-0 flex-1">
              <h2 className="break-words text-lg font-semibold leading-tight">{name}</h2>
              {email && email !== name && <p className="break-all text-sm text-vc-text/60">{email}</p>}
              {tag && <div className="mt-1.5">{tag}</div>}
              {bio && <p className="mt-2 text-sm text-vc-text/80">{bio}</p>}
              {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          </div>
          {tabs.length > 1 && <Tabs tabs={tabs.map(({ content: _content, ...rest }) => rest)} value={active?.id ?? ""} onChange={setTab} className="px-2" />}
          <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto p-4 vc-scroll-hover">{typeof active?.content === "function" ? active.content({ goTo: setTab }) : active?.content}</div>
        </div>,
        document.body,
      )}
    </>
  );
}
