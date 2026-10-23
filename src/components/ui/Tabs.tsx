import { ReactNode, useEffect, useRef, KeyboardEvent } from "react";
import { isMobileViewport } from "../../utils/viewport";

export interface TabItem {
  id: string;
  label: ReactNode;
  /** Petite icône affichée avant le libellé. */
  icon?: ReactNode;
  /** Pastille de comptage / statut affichée après le libellé. */
  badge?: ReactNode;
  disabled?: boolean;
  /** Contenu affiché sous la barre quand l'onglet est actif (facultatif : on peut aussi piloter le contenu soi-même via `value`). */
  content?: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Id de l'onglet actif. */
  value: string;
  onChange: (id: string) => void;
  /** Classes du conteneur de la barre. */
  className?: string;
  /** Classes du bloc de contenu (si les onglets portent un `content`). */
  contentClassName?: string;
}

/**
 * Barre d'onglets soulignée : un onglet actif marqué par un trait `vc-main`, défilement horizontal si ça déborde,
 * navigation clavier (flèches, Début, Fin). Si les onglets portent un `content`, celui de l'onglet actif est rendu dessous.
 * @see {@link https://vcomponents.tmenv.fr/?path=/docs/ui-tabs--docs}
 */
export default function Tabs({ tabs, value, onChange, className = "", contentClassName = "" }: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = tabs.filter((t) => !t.disabled);
  const active = tabs.find((t) => t.id === value);

  // Téléphone : l'onglet actif reste visible dans la barre qui défile.
  useEffect(() => {
    if (!isMobileViewport()) return;
    refs.current[value]?.scrollIntoView?.({ block: "nearest", inline: "center" });
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = enabled.findIndex((t) => t.id === value);
    let next: TabItem | undefined;
    if (e.key === "ArrowRight") next = enabled[(i + 1) % enabled.length];
    else if (e.key === "ArrowLeft") next = enabled[(i - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (!next) return;
    e.preventDefault();
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        onKeyDown={onKeyDown}
        className={`flex gap-1 overflow-x-auto overflow-y-hidden border-b border-vc-line vc-scroll-hover ${className}`}
      >
        {tabs.map((t) => {
          const selected = t.id === value;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`tabpanel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={t.disabled}
              onClick={() => onChange(t.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 max-sm:min-h-11 max-sm:py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                selected
                  ? "border-vc-main font-medium text-vc-text"
                  : "border-transparent text-vc-text/60 hover:border-vc-line-strong hover:text-vc-text"
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge !== undefined && t.badge !== null && (
                <span className="rounded-full bg-vc-veil-strong px-2 py-0.5 text-xs leading-none text-vc-text/70">{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {active?.content !== undefined && (
        <div role="tabpanel" id={`tabpanel-${active.id}`} aria-labelledby={`tab-${active.id}`} className={contentClassName}>
          {active.content}
        </div>
      )}
    </div>
  );
}
