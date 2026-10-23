import clsx from "clsx";

export interface ReactionPillProps {
  /** Emoji de la réaction. */
  emoji: string;
  /** Nombre de personnes qui l'ont posée. */
  count: number;
  /** Vrai si la personne connectée l'a posée (un nouveau clic la retire). */
  active?: boolean;
  /** Info-bulle (ex. « Julien, Mélina »). */
  title?: string;
  onClick?: () => void;
  className?: string;
}

/** Pastille de réaction d'un message : emoji + compteur, en surbrillance quand c'est la mienne. */
export default function ReactionPill({ emoji, count, active = false, title, onClick, className }: ReactionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={clsx(
        "inline-flex h-6 max-sm:h-8 cursor-pointer items-center gap-1 rounded-full border px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50",
        active ? "border-vc-main/60 bg-vc-main/15 text-vc-text" : "border-vc-line-strong bg-vc-veil text-vc-text/80 hover:bg-vc-veil-strong",
        className,
      )}
    >
      <span aria-hidden>{emoji}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
