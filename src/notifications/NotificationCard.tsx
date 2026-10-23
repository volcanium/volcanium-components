import type { ReactNode } from "react";
import clsx from "clsx";
import { IconArrowBackUp, IconBell, IconCalendarEvent, IconFileInvoice, IconMail, IconMessage, IconPhone, IconPhoneOff, IconX, IconExternalLink } from "@tabler/icons-react";
import Avatar from "../components/ui/Avatar";
import { useLanguage, type TranslationKey } from "../utils/useLanguage";
import type { NotificationAction, NotificationItem } from "./NotificationProvider";

const ICONS: Record<string, ReactNode> = {
  answer: <IconPhone size={20} aria-hidden />,
  decline: <IconPhoneOff size={20} aria-hidden />,
  messages: <IconMessage size={20} aria-hidden />,
  open: <IconExternalLink size={20} aria-hidden />,
  reply: <IconArrowBackUp size={20} aria-hidden />,
};
// Icone par defaut d'un `kind` quand la notification n'a pas d'`image`.
const KIND_ICONS: Record<string, ReactNode> = {
  message: <IconMessage size={24} aria-hidden />,
  mail: <IconMail size={24} aria-hidden />,
  invoice: <IconFileInvoice size={24} aria-hidden />,
  quote: <IconFileInvoice size={24} aria-hidden />,
  calendar: <IconCalendarEvent size={24} aria-hidden />,
};
const DEFAULT_KIND_ICON = <IconBell size={24} aria-hidden />;
const LABELS: Record<string, TranslationKey> = {
  answer: "notif_answer",
  decline: "notif_decline",
  messages: "notif_messages",
  open: "notif_open",
  reply: "notif_reply",
};
// Style par defaut d'une action connue ; une app peut l'imposer avec `style`.
const DEFAULT_STYLE: Record<string, NonNullable<NotificationAction["style"]>> = { answer: "primary", decline: "danger" };

export interface NotificationCardProps {
  item: NotificationItem;
  onAction: (item: NotificationItem, action: NotificationAction) => void;
  onDismiss: (item: NotificationItem) => void;
  /** Survol / focus de la carte : `true` = geler l'expiration, `false` = la reprendre. */
  onHoldChange?: (item: NotificationItem, held: boolean) => void;
  /** Joue l'animation de sortie (la carte va etre retiree). */
  leaving?: boolean;
  className?: string;
}

/** Une carte de notification (photo, texte, boutons d'action) : affichee par `NotificationProvider`, utilisable seule (histoires, tests). */
export default function NotificationCard({ item, onAction, onDismiss, onHoldChange, leaving, className }: NotificationCardProps) {
  const { t } = useLanguage();
  const bodyKey = item.bodyKey ? (`notif_body_${item.bodyKey}` as TranslationKey) : undefined;
  const translated = bodyKey ? t(bodyKey) : undefined;
  const body = translated && translated !== bodyKey ? translated : item.body;
  // Clic sur le corps (hors appel : on ne decroche pas par erreur) = action `open`, sinon la premiere action qui ouvre une adresse.
  const opener = item.ring ? undefined : item.actions.find((a) => a.id === "open") ?? item.actions.find((a) => a.href);
  const isCall = item.kind === "call" || item.ring;
  const hold = (held: boolean) => onHoldChange?.(item, held);
  return (
    <div
      role={item.ring || item.priority === "high" ? "alert" : "status"}
      onPointerEnter={() => hold(true)}
      onPointerLeave={() => hold(false)}
      onFocus={() => hold(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hold(false); }}
      className={clsx(
        leaving ? "vc-notif-out" : "vc-notif-in",
        "pointer-events-auto w-full overflow-hidden rounded-2xl border bg-vc-container text-vc-text shadow-2xl",
        item.priority === "high" ? "border-vc-main/60" : "border-vc-line-strong",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <div
          onClick={opener ? () => onAction(item, opener) : undefined}
          className={clsx("flex min-w-0 flex-1 items-center gap-3", opener && "cursor-pointer")}
        >
        <span className={clsx("relative inline-flex shrink-0 rounded-full", item.ring && !item.silent && "vc-notif-ring")}>
          {isCall || item.image ? (
            <Avatar name={item.title} src={item.image} size={48} />
          ) : (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-vc-main/15 text-vc-main">{KIND_ICONS[item.kind] ?? DEFAULT_KIND_ICON}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{item.title}</p>
          {body && <p className={clsx("mt-0.5 text-xs text-vc-text/70", isCall ? "truncate" : "line-clamp-2 break-words")}>{body}</p>}
          {item.subtitle && <p className="truncate text-xs text-vc-text/50">{item.subtitle}</p>}
        </div>
        </div>
        <button
          type="button"
          aria-label={t("close")}
          title={t("notif_dismiss")}
          onClick={() => onDismiss(item)}
          className="-mr-1 -mt-5 inline-flex h-7 w-7 max-sm:h-10 max-sm:w-10 max-sm:-mr-2 max-sm:-mt-6 shrink-0 cursor-pointer items-center justify-center self-start rounded-full text-vc-text/50 transition-colors hover:bg-vc-veil-strong hover:text-vc-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50"
        >
          <IconX size={14} aria-hidden />
        </button>
      </div>
      {item.actions.length > 0 && (
        <div className="grid grid-flow-col auto-cols-fr gap-2 px-4 pb-4">
          {item.actions.map((a) => {
            const style = a.style ?? DEFAULT_STYLE[a.id] ?? "secondary";
            const key = LABELS[a.id];
            const label = a.label ?? (key ? t(key) : a.id);
            const icon = ICONS[a.id];
            return (
              <button
                key={a.id}
                type="button"
                aria-label={label}
                title={label}
                onClick={() => onAction(item, a)}
                className={clsx(
                  "inline-flex h-10 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-medium shadow-sm transition-all hover:scale-[1.03] hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50",
                  style === "primary" && "bg-vc-success text-vc-back",
                  style === "danger" && "bg-vc-danger text-vc-on-main",
                  style === "secondary" && "border border-vc-line-strong bg-vc-veil text-vc-text hover:bg-vc-veil-strong",
                )}
              >
                {icon ?? label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
