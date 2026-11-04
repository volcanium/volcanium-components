/** Libellés COURTS des liens légaux du pied de sidebar : une seule source pour toutes les apps (ordre et textes identiques partout).
 *  Les apps passent `legalLinkLabel(id, langue)` comme `label` de `Sidebar.legalLinks` (et sur leurs écrans de blocage légal). */
export type LegalLinkId = "cgu" | "privacy" | "mentions" | "cookies" | "rights";

/** Ordre d'affichage commun. */
export const LEGAL_LINK_IDS: readonly LegalLinkId[] = ["cgu", "privacy", "mentions", "cookies", "rights"];

export const LEGAL_LINK_LABELS: Record<"fr" | "en" | "es", Record<LegalLinkId, string>> = {
  fr: { cgu: "CGU", privacy: "Confidentialité", mentions: "Mentions légales", cookies: "Cookies", rights: "Vos droits" },
  en: { cgu: "Terms", privacy: "Privacy", mentions: "Legal notice", cookies: "Cookies", rights: "Your rights" },
  es: { cgu: "Condiciones", privacy: "Privacidad", mentions: "Aviso legal", cookies: "Cookies", rights: "Tus derechos" },
};

/** Libellé d'un lien légal dans la langue donnée (`fr`, `en`, `es` ; toute autre valeur, ou un code régional comme `fr-FR`, retombe sur la langue de base puis sur l'anglais). */
export function legalLinkLabel(id: LegalLinkId, language?: string | null): string {
  const base = (language ?? "").toLowerCase().split(/[-_]/)[0] as "fr" | "en" | "es";
  return (LEGAL_LINK_LABELS[base] ?? LEGAL_LINK_LABELS.en)[id];
}
