// Memorisation du theme (« dark » | « light ») : un COOKIE sur le domaine parent (ex. `.volcanium.eu`) pour que le choix fait dans Compte
// s'applique a toutes les apps (chacune a son sous-domaine, donc son propre localStorage), puis le localStorage (hors ligne, dev, cookies refuses).

export type StoredTheme = "dark" | "light";

/** Nom du cookie partage (et cle du localStorage). */
export const THEME_COOKIE = "volcanium-theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

const isTheme = (v: unknown): v is StoredTheme => v === "dark" || v === "light";

/**
 * Domaine du cookie : le domaine parent (les deux derniers libelles : `compte.volcanium.eu` -> `.volcanium.eu`).
 * Aucun pour `localhost`, une adresse IP ou un nom sans point : le cookie reste alors propre a l'hote (en dev, `localhost` partage deja ses
 * cookies entre tous les ports).
 */
export function themeCookieDomain(hostname: string): string | undefined {
  const host = hostname.trim().toLowerCase();
  if (!host.includes(".") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return undefined;
  const labels = host.split(".");
  return labels.length <= 2 ? `.${host}` : `.${labels.slice(-2).join(".")}`;
}

/** Valeur du cookie dans une chaine `document.cookie`, ou `undefined`. */
export function parseThemeCookie(cookieString: string, name = THEME_COOKIE): StoredTheme | undefined {
  for (const part of cookieString.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      const v = decodeURIComponent(rest.join("="));
      return isTheme(v) ? v : undefined;
    }
  }
  return undefined;
}

/** Texte a ecrire dans `document.cookie` pour memoriser le theme (tous les sous-domaines, un an, `Secure` en https). */
export function serializeThemeCookie(theme: StoredTheme, location: { hostname: string; protocol: string }, name = THEME_COOKIE, domain?: string | false): string {
  const d = domain === false ? undefined : domain ?? themeCookieDomain(location.hostname);
  return `${name}=${theme}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${d ? `; Domain=${d}` : ""}${location.protocol === "https:" ? "; Secure" : ""}`;
}

/** Theme memorise : le cookie partage d'abord, puis le localStorage (et ses anciennes cles). */
export function readSharedTheme(legacyKeys: readonly string[] = []): StoredTheme | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const fromCookie = parseThemeCookie(document.cookie);
    if (fromCookie) return fromCookie;
  } catch { /* cookies indisponibles */ }
  try {
    for (const k of [THEME_COOKIE, ...legacyKeys]) {
      const v = window.localStorage.getItem(k);
      if (isTheme(v)) return v;
    }
  } catch { /* stockage indisponible (navigation privee...) */ }
  return undefined;
}

/** Memorise le theme dans le cookie partage ET le localStorage ; l'un ou l'autre peut echouer sans consequence. */
export function writeSharedTheme(theme: StoredTheme, domain?: string | false): void {
  if (typeof window === "undefined") return;
  try { document.cookie = serializeThemeCookie(theme, window.location, THEME_COOKIE, domain); } catch { /* cookies refuses */ }
  try { window.localStorage.setItem(THEME_COOKIE, theme); } catch { /* stockage indisponible */ }
}
