import type { ReactNode } from "react";
import clsx from "clsx";
import { IconMessage, IconPhone, IconPhoneOff, IconX, IconExternalLink } from "@tabler/icons-react";
import Avatar from "../components/ui/Avatar";
import { useLanguage, type TranslationKey } from "../utils/useLanguage";
import type { NotificationAction, NotificationItem } from "./NotificationProvider";

const ICONS: Record<string, ReactNode> = {
  answer: <IconPhone size={16} aria-hidden />,
  decline: <IconPhoneOff size={16} aria-hidden />,
  messages: <IconMessage size={16} aria-hidden />,
  open: <IconExternalLink size={16} aria-hidden />,
};
const LABELS: Record<string, TranslationKey> = {
  answer: "notif_answer",
  decline: "notif_decline",
  messages: "notif_messages",
  open: "notif_open",
};
// Style par defaut d'une action connue ; une app peut l'imposer avec `style`.
const DEFAULT_STYLE: Record<string, NonNullable<NotificationAction["style"]>> = { answer: "primary", decline: "danger" };

export interface NotificationCardProps {
  item: NotificationItem;
  onAction: (item: NotificationItem, action: NotificationAction) => void;
  onDismiss: (item: NotificationItem) => void;
  className?: string;
}

/** Une carte de notification (photo, texte, boutons d'action) : affichee par `NotificationProvider`, utilisable seule (histoires, tests). */
export default function NotificationCard({ item, onAction, onDismiss, className }: NotificationCardProps) {
  const { t } = useLanguage();
  const bodyKey = item.bodyKey ? (`notif_body_${item.bodyKey}` as TranslationKey) : undefined;
  const translated = bodyKey ? t(bodyKey) : undefined;
  const body = translated && translated !== bodyKey ? translated : item.body;
  return (
    <div
      role="alert"
      className={clsx("vc-notif-in pointer-events-auto w-full overflow-hidden rounded-xl border border-vc-line-strong bg-vc-container text-vc-text shadow-2xl", className)}
    >
      <div className="flex items-start gap-3 p-3">
        <span className={clsx("relative mt-0.5 inline-flex shrink-0 rounded-full", item.ring && !item.silent && "vc-notif-ring")}>
          <Avatar name={item.title} src={item.image} size={44} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.title}</p>
          {body && <p className="truncate text-xs text-vc-text/70">{body}</p>}
          {item.subtitle && <p className="truncate text-xs text-vc-text/50">{item.subtitle}</p>}
        </div>
        <button
          type="button"
          aria-label={t("close")}
          title={t("notif_dismiss")}
          onClick={() => onDismiss(item)}
          className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-vc-text/60 transition-colors hover:bg-vc-veil-strong hover:text-vc-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50"
        >
          <IconX size={14} aria-hidden />
        </button>
      </div>
      {item.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-vc-line bg-vc-veil px-3 py-2">
          {item.actions.map((a) => {
            const style = a.style ?? DEFAULT_STYLE[a.id] ?? "secondary";
            const key = LABELS[a.id];
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onAction(item, a)}
                className={clsx(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50",
                  style === "primary" && "bg-vc-success text-vc-back",
                  style === "danger" && "bg-vc-danger text-vc-on-main",
                  style === "secondary" && "border border-vc-line-strong bg-vc-veil text-vc-text hover:bg-vc-veil-strong",
                )}
              >
                {ICONS[a.id]}
                {a.label ?? (key ? t(key) : a.id)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
