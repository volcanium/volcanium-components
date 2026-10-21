import type { ReactNode } from "react";
import clsx from "clsx";
import Avatar from "./Avatar";

export interface MessageItemProps {
  /** Auteur : nom affiché, photo (facultative) et adresse (initiales de secours). */
  author: { name: string; email?: string; src?: string | null };
  /** Heure déjà formatée (« 14:32 »). */
  time: string;
  /** Texte d'info-bulle de l'heure (date complète). */
  timeTitle?: string;
  /** Mention « modifié » déjà traduite ; absente = message non modifié. */
  editedLabel?: string;
  /** Continuation d'un message du même auteur : ni photo ni nom, seulement l'heure au survol. */
  compact?: boolean;
  /** Surligne le message (résultat de recherche, message cité). */
  highlighted?: boolean;
  /** Corps du message (texte mis en forme par l'application). */
  children: ReactNode;
  /** Pièces jointes, réactions, lien « N réponses » : sous le texte. */
  footer?: ReactNode;
  /** Barre d'actions (réagir, répondre, modifier…) : visible au survol et au focus. */
  actions?: ReactNode;
  className?: string;
}

/** Une ligne de conversation (chat d'équipe) : photo, auteur, heure, corps, pied et actions au survol. */
export default function MessageItem({ author, time, timeTitle, editedLabel, compact = false, highlighted = false, children, footer, actions, className }: MessageItemProps) {
  return (
    <div
      className={clsx(
        "group relative flex gap-3 rounded-md px-4 transition-colors hover:bg-vc-veil focus-within:bg-vc-veil",
        compact ? "py-0.5" : "pt-2 pb-0.5",
        highlighted && "bg-vc-main/10",
        className,
      )}
    >
      <div className="w-9 shrink-0">
        {compact ? (
          <span title={timeTitle} className="invisible block pt-1 text-right text-[10px] leading-5 text-vc-text/50 group-hover:visible group-focus-within:visible">
            {time}
          </span>
        ) : (
          <Avatar name={author.name} email={author.email} src={author.src} size={36} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!compact && (
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-vc-text">{author.name}</span>
            <time title={timeTitle} className="shrink-0 text-xs text-vc-text/50">
              {time}
            </time>
          </div>
        )}
        <div className="text-sm leading-6 text-vc-text break-words">
          {children}
          {editedLabel && <span className="ml-1 text-xs text-vc-text/50">({editedLabel})</span>}
        </div>
        {footer && <div className="mt-1 flex flex-wrap items-center gap-1.5">{footer}</div>}
      </div>
      {actions && (
        <div className="invisible absolute -top-3 right-4 z-10 flex items-center gap-0.5 rounded-md border border-vc-line-strong bg-vc-container p-0.5 shadow-sm group-hover:visible group-focus-within:visible">
          {actions}
        </div>
      )}
    </div>
  );
}
