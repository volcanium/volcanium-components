import type { PostalAddress } from "./api";

/** Adresse postale sur plusieurs lignes : rue, code postal et ville, pays (miroir du serveur). */
export const formatAddress = (a: Pick<PostalAddress, "street" | "postalCode" | "city" | "country">): string =>
  [a.street, [a.postalCode, a.city].filter(Boolean).join(" "), a.country].filter(Boolean).join("\n");
