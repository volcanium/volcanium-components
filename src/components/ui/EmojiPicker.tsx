import clsx from "clsx";

export interface EmojiPickerProps {
  /** Appelé avec l'emoji choisi. */
  onPick: (emoji: string) => void;
  /** Nom accessible de la grille (« Choisir un emoji »). */
  label: string;
  /** Emojis proposés ; par défaut une sélection courante (réactions et messages de travail). */
  emojis?: string[];
  className?: string;
}

export const DEFAULT_EMOJIS = [
  "👍", "👎", "👏", "🙌", "🙏", "💪", "👌", "✌️", "🤝", "👀", "🔥", "🎉",
  "❤️", "💯", "✅", "❌", "⚠️", "❓", "💡", "⭐", "🚀", "🎯", "📌", "📎",
  "😀", "😄", "😁", "😂", "🤣", "😊", "😍", "😘", "😎", "🤔", "🙂", "😉",
  "😅", "😭", "😢", "😡", "😱", "🥳", "😴", "🤯", "🤩", "😬", "🙄", "😇",
];

/** Grille d'emojis courants à cliquer ; sert aux réactions et à l'insertion dans un message. */
export default function EmojiPicker({ onPick, label, emojis = DEFAULT_EMOJIS, className }: EmojiPickerProps) {
  return (
    <div role="group" aria-label={label} className={clsx("grid w-72 max-w-full grid-cols-8 gap-0.5 rounded-lg border border-vc-line-strong bg-vc-container p-2 shadow-lg", className)}>
      {emojis.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onPick(e)}
          className="inline-flex h-8 w-8 max-sm:h-auto max-sm:aspect-square max-sm:w-full cursor-pointer items-center justify-center rounded-md text-lg transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50"
        >
          <span aria-hidden>{e}</span>
          <span className="sr-only">{e}</span>
        </button>
      ))}
    </div>
  );
}
