import clsx from "clsx";
import Avatar from "./Avatar";

export interface AvatarStackPerson {
  id: string;
  name: string;
  /** URL de la photo ; à défaut, les initiales. */
  image?: string | null;
  /** Couleur d'anneau propre à la personne (ex. la couleur de son curseur dans un document partagé). */
  color?: string;
}

export interface AvatarStackProps {
  people: AvatarStackPerson[];
  /** Nombre de photos affichées avant « +N ». @default 4 */
  max?: number;
  /** Diamètre d'une photo en pixels. @default 28 */
  size?: number;
  /** Libellé de l'ensemble pour les lecteurs d'écran (ex. « 5 personnes sur le tableau »). */
  label: string;
  className?: string;
}

/** Photos qui se chevauchent : qui est présent sur un document, une réunion, une conversation. */
export default function AvatarStack({ people, max = 4, size = 28, label, className }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const more = people.length - shown.length;
  return (
    <div role="group" aria-label={label} className={clsx("flex items-center", className)}>
      {shown.map((p, i) => (
        <span key={p.id} title={p.name} style={{ marginLeft: i === 0 ? 0 : -size * 0.3, zIndex: shown.length - i, boxShadow: `0 0 0 2px ${p.color ?? "var(--color-vc-back)"}` }} className="relative inline-flex rounded-full">
          <Avatar name={p.name} src={p.image} size={size} />
        </span>
      ))}
      {more > 0 && (
        <span aria-hidden style={{ marginLeft: -size * 0.3, width: size, height: size, fontSize: Math.round(size * 0.38) }} className="relative inline-flex items-center justify-center rounded-full bg-vc-veil-strong font-medium text-vc-text ring-2 ring-vc-back">
          +{more}
        </span>
      )}
    </div>
  );
}
