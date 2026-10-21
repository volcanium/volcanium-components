import clsx from "clsx";
import { useLanguage } from "../utils/useLanguage";

/** Statut de presence partage par toutes les apps (service dans Volcanium Compte). */
export type PresenceStatus = "online" | "offline" | "idle" | "in_call" | "dnd";
/** Statuts qu'on peut choisir a la main (`auto` = en ligne, calcule : actif / inactif selon l'activite). */
export type ManualPresence = "idle" | "in_call" | "dnd" | "offline";

export const PRESENCE_STATUSES: readonly PresenceStatus[] = ["online", "idle", "in_call", "dnd", "offline"];

const LABEL_KEY = {
  online: "presence_online",
  offline: "presence_offline",
  idle: "presence_idle",
  in_call: "presence_in_call",
  dnd: "presence_dnd",
} as const;

export const presenceLabelKey = (status: PresenceStatus) => LABEL_KEY[status];

const COLOR: Record<PresenceStatus, string> = {
  online: "bg-vc-success",
  idle: "bg-vc-warning",
  in_call: "bg-vc-danger",
  dnd: "bg-vc-danger",
  offline: "bg-vc-secondary/40",
};

export interface PresenceDotProps {
  status: PresenceStatus;
  /** Diametre en pixels. @default 12 */
  size?: number;
  /** Pose le rond dans le coin bas droit du parent (qui doit etre `relative`) avec un liseré qui le detache de la photo. */
  corner?: boolean;
  className?: string;
}

/** Rond de statut : vert en ligne, gris hors ligne, jaune inactif, rouge en appel, rouge barre blanche ne pas deranger. */
export default function PresenceDot({ status, size = 12, corner = false, className }: PresenceDotProps) {
  const { t } = useLanguage();
  const label = t(LABEL_KEY[status]);
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        COLOR[status],
        corner && "absolute bottom-0 right-0 ring-2 ring-vc-back",
        className,
      )}
    >
      {status === "dnd" && <span aria-hidden style={{ width: size * 0.58, height: Math.max(2, Math.round(size * 0.17)) }} className="rounded-full bg-vc-on-main" />}
    </span>
  );
}
