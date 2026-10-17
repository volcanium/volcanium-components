/** Longueur maximale (ellipse comprise) du texte sous le nom dans la carte utilisateur. */
export const USER_SUBTITLE_MAX_LENGTH = 30;

/**
 * Initiales affichées quand la personne n'a pas de photo : première lettre du premier et du dernier mot
 * (« Julien Rilliot » → « JR »), ou une seule lettre pour un seul mot. Repli : « U ».
 */
export function getInitials(name?: string | null): string {
  const words = (name ?? "")
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (words.length === 0) return "U";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toLocaleUpperCase() || "U";
}

/** Coupe `text` à `max` caractères en terminant par « … » quand c'est trop long. */
export function truncateWithEllipsis(text: string, max: number = USER_SUBTITLE_MAX_LENGTH): string {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  return chars.slice(0, Math.max(1, max - 1)).join("").trimEnd() + "…";
}

/**
 * Texte affiché sous le nom : « Titre - Organisation » pour un compte pro, sinon juste le titre.
 * Trop long, il est coupé en « Titre - Nom de l'o… » (le titre est gardé en entier tant qu'il tient).
 */
export function formatUserTitle(
  parts: { title?: string | null; organization?: string | null },
  max: number = USER_SUBTITLE_MAX_LENGTH,
): string {
  const title = parts.title?.trim() ?? "";
  const organization = parts.organization?.trim() ?? "";
  if (!organization) return truncateWithEllipsis(title, max);
  if (!title) return truncateWithEllipsis(organization, max);
  return truncateWithEllipsis(`${title} - ${organization}`, max);
}
