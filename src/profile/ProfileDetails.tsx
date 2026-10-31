import type { ReactNode } from "react";
import { IconBuilding, IconMapPin, IconMoodSmile, IconNotes, IconWorld } from "@tabler/icons-react";
import { useLanguage } from "../utils/useLanguage";
import type { ProfileCard } from "./useProfileCard";

const isWebUrl = (u: string): boolean => /^https?:\/\/[^\s]+$/i.test(u);
// La bio arrive en HTML deja nettoye par Compte ; on n'en montre que le texte (pas de balises interpretees ici).
const plainText = (html: string | null): string => (html ? (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "").trim() : "");

/** Ce que la personne montre d'elle (profil public) : seulement les lignes renseignees. `null` s'il n'y a rien a montrer. */
export default function ProfileDetails({ card }: { card: ProfileCard }) {
  const { t } = useLanguage();
  const p = card.profile;
  if (!p) return null;
  const rows: { key: string; icon: ReactNode; label: string; value: ReactNode }[] = [];
  const add = (key: string, icon: ReactNode, label: string, value: ReactNode) => rows.push({ key, icon, label, value });
  if (card.organization) add("org", <IconBuilding size={18} />, t("profile_company"), card.organization.name);
  if (p.pronouns) add("pron", <IconMoodSmile size={18} />, t("profile_pronouns"), p.pronouns);
  if (p.location) add("loc", <IconMapPin size={18} />, t("profile_location"), p.location);
  if (p.website && isWebUrl(p.website)) add("web", <IconWorld size={18} />, t("profile_website"), <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-vc-main hover:underline">{p.website}</a>);
  const bio = plainText(p.bio);
  if (bio) add("bio", <IconNotes size={18} />, t("profile_bio"), <p className="whitespace-pre-line">{bio}</p>);
  if (!rows.length) return null;
  return (
    <section className="mb-4 space-y-3">
      {rows.map((r) => (
        <div key={r.key} className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5 shrink-0">{r.icon}</span>
          <div className="min-w-0"><p className="text-xs text-vc-text/60">{r.label}</p><div className="break-words text-sm">{r.value}</div></div>
        </div>
      ))}
    </section>
  );
}
