import { useEffect, useState } from "react";
import clsx from "clsx";

export interface AvatarProps {
  /** Nom de la personne (sert aux initiales et au texte alternatif). Une adresse e-mail est aussi acceptée. */
  name: string;
  /** Adresse e-mail : à défaut de nom exploitable, ses premières lettres donnent les initiales. */
  email?: string;
  /** URL de la photo ; si elle manque ou ne charge pas, les initiales s'affichent. */
  src?: string | null;
  /** Diamètre en pixels. @default 40 */
  size?: number;
  className?: string;
}

/** Initiales de deux lettres au plus (« Julien Rilliot » → JR) ; nom absent ou égal à une adresse : début de l'adresse. */
export function initialsOf(name: string | null | undefined, email = ""): string {
  const cleaned = (name ?? "").replace(/[<>"()]/g, " ").trim();
  const useName = cleaned !== "" && !cleaned.includes("@") && /\p{L}/u.test(cleaned);
  const source = useName ? cleaned.split(/\s+/) : (email || cleaned).split("@")[0]!.split(/[._+-]+/);
  const words = source.filter((w) => /\p{L}/u.test(w));
  if (words.length === 0) return "?";
  const first = [...words[0]!][0]!;
  const last = words.length > 1 ? [...words[words.length - 1]!][0]! : "";
  return (first + last).toUpperCase();
}

const TONES = ["bg-vc-main text-vc-on-main", "bg-vc-accent text-vc-on-main"];
const toneOf = (seed: string) => TONES[[...seed.toLowerCase()].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TONES.length]!;

/** Pastille ronde : photo de profil, ou initiales sur fond de marque. */
export default function Avatar({ name, email, src, size = 40, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const box = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (src && !failed) {
    return <img src={src} alt="" aria-hidden onError={() => setFailed(true)} style={box} className={clsx("shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span aria-hidden style={box} className={clsx("inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium", toneOf(email || name), className)}>
      {initialsOf(name, email)}
    </span>
  );
}
