import type { ReactNode } from "react";
import clsx from "clsx";
import { IconHandStop, IconMicrophoneOff } from "@tabler/icons-react";
import Avatar from "./Avatar";

export interface VideoTileProps {
  /** Nom affiché sous la vidéo. */
  name: string;
  /** Photo du compte (affichée tant que la caméra est coupée). */
  src?: string | null;
  /** L'élément vidéo (`<video>` géré par l'application) ; absent = caméra coupée, la photo s'affiche. */
  video?: ReactNode;
  /** Micro coupé : une icône barrée apparaît à côté du nom. */
  micOff?: boolean;
  /** Personne en train de parler : liseré de marque. */
  speaking?: boolean;
  /** Main levée. Texte alternatif ci-dessous. */
  handRaised?: boolean;
  handLabel?: string;
  micOffLabel?: string;
  /** Mention affichée à côté du nom (« Vous », « Invité »…), déjà traduite. */
  badge?: string;
  /** Actions au survol (couper le micro, retirer…). */
  actions?: ReactNode;
  className?: string;
}

/** Tuile d'un participant de visioconférence : vidéo ou photo, nom, micro coupé, prise de parole. Reçoit sa vidéo en enfant. */
export default function VideoTile({ name, src, video, micOff = false, speaking = false, handRaised = false, handLabel, micOffLabel, badge, actions, className }: VideoTileProps) {
  return (
    <div
      className={clsx(
        "group relative flex aspect-video min-h-0 items-center justify-center overflow-hidden rounded-xl border bg-vc-container transition-shadow",
        speaking ? "border-vc-main ring-2 ring-vc-main/60" : "border-vc-line",
        className,
      )}
    >
      {video ?? <Avatar name={name} src={src} size={72} />}
      <div className="absolute bottom-2 left-2 flex max-w-[85%] items-center gap-1.5 rounded-md bg-vc-scrim px-2 py-1 text-xs text-vc-text">
        {micOff && <IconMicrophoneOff size={14} aria-label={micOffLabel} className="shrink-0 text-vc-danger" />}
        <span className="truncate">{name}</span>
        {badge && <span className="shrink-0 text-vc-text/60">· {badge}</span>}
      </div>
      {handRaised && (
        <span className="absolute right-2 top-2 rounded-full bg-vc-main p-1.5 text-vc-on-main" role="img" aria-label={handLabel}>
          <IconHandStop size={16} />
        </span>
      )}
      {actions && <div className="invisible absolute right-2 bottom-2 flex gap-1 group-hover:visible group-focus-within:visible">{actions}</div>}
    </div>
  );
}
