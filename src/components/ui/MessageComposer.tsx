import { useEffect, useRef, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import { IconSend2 } from "@tabler/icons-react";

export interface MessageComposerProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "rows"> {
  value: string;
  onChange: (value: string) => void;
  /** Clic sur le bouton d'envoi (la touche Entrée se gère dans `onKeyDown`, pour laisser passer menus de mentions et composition IME). */
  onSend: () => void;
  /** Vrai quand il y a quelque chose à envoyer et que rien ne l'empêche. */
  canSend: boolean;
  /** Envoi en cours : le bouton pulse et se désactive. */
  sending?: boolean;
  /** Nom accessible du bouton d'envoi. */
  sendLabel: string;
  /** Boutons à gauche sous le champ (pièce jointe, emoji, mention…). */
  toolbar?: ReactNode;
  /** Au-dessus du champ : pièces jointes en attente, bandeau « modification en cours ». */
  top?: ReactNode;
  /** Fenêtre flottante ancrée au composeur (suggestions de mentions, sélecteur d'emoji). */
  popover?: ReactNode;
  textareaRef?: Ref<HTMLTextAreaElement>;
  /** Hauteur maximale en lignes avant défilement. @default 8 */
  maxRows?: number;
  className?: string;
}

const LINE = 24;

/** Zone de saisie d'un message de chat : champ à hauteur automatique, barre d'outils, bouton d'envoi, emplacements pour pièces jointes et suggestions. */
export default function MessageComposer({ value, onChange, onSend, canSend, sending = false, sendLabel, toolbar, top, popover, textareaRef, maxRows = 8, className, disabled, ...props }: MessageComposerProps) {
  const local = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = local.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, LINE * maxRows)}px`;
  }, [value, maxRows]);

  return (
    <div className={clsx("relative rounded-lg border border-vc-line-strong bg-vc-container focus-within:border-vc-main/60", disabled && "opacity-60", className)}>
      {popover}
      {top}
      <textarea
        {...props}
        ref={(el) => {
          local.current = el;
          if (typeof textareaRef === "function") textareaRef(el);
          else if (textareaRef) (textareaRef as { current: HTMLTextAreaElement | null }).current = el;
        }}
        value={value}
        rows={1}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-sm max-sm:text-base leading-6 text-vc-text outline-none placeholder:text-vc-text/40"
      />
      <div className="flex items-center justify-between gap-2 px-2 pb-2">
        <div className="flex items-center gap-1">{toolbar}</div>
        <button
          type="button"
          aria-label={sendLabel}
          title={sendLabel}
          disabled={!canSend || sending || disabled}
          onClick={onSend}
          className={clsx(
            "inline-flex h-8 w-8 max-sm:h-10 max-sm:w-10 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 disabled:cursor-not-allowed",
            canSend ? "bg-vc-main text-vc-on-main hover:brightness-110" : "text-vc-text/40",
            sending && "animate-pulse",
          )}
        >
          <IconSend2 size={18} />
        </button>
      </div>
    </div>
  );
}
