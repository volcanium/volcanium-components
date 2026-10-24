// Adresses e-mail : validation et lecture d'une liste saisie a la main (miroir de lib/compose.ts de Volcanium Mail).

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
export const isValidEmail = (value: string): boolean => value.length <= 254 && EMAIL.test(value.trim());

export interface Recipient { name: string | null; email: string }

/** « Marie <m@x.fr>, b@y.fr ; "Dupont, Jean" <j@z.fr> » -> destinataires ; les morceaux invalides sont renvoyes a part. */
export function parseRecipients(text: string): { valid: Recipient[]; invalid: string[] } {
  const valid: Recipient[] = [];
  const invalid: string[] = [];
  // Separateurs : virgule, point-virgule, saut de ligne ; une virgule DANS des guillemets ne separe pas.
  const parts: string[] = [];
  let current = "";
  let quoted = false;
  for (const ch of text) {
    if (ch === '"') quoted = !quoted;
    if (!quoted && (ch === "," || ch === ";" || ch === "\n")) { parts.push(current); current = ""; } else current += ch;
  }
  parts.push(current);
  for (const raw of parts.map((p) => p.trim()).filter(Boolean)) {
    const m = raw.match(/^(.*)<([^<>]+)>$/);
    const email = (m ? m[2]! : raw).trim();
    const name = m ? m[1]!.trim().replace(/^"(.*)"$/, "$1").trim() : "";
    if (isValidEmail(email)) valid.push({ name: name || null, email: email.toLowerCase() });
    else invalid.push(raw);
  }
  return { valid, invalid };
}
