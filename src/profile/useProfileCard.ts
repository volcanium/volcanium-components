import { useEffect, useState } from "react";
import { useCompteAccess } from "../presence/PresenceProvider";

/** Partie publique d'un profil, telle que Compte la laisse voir a celui qui regarde (voir `GET /user/profiles/:userId`). */
export interface PublicProfileFields {
  displayName: string | null;
  bio: string | null;
  pronouns: string | null;
  location: string | null;
  website: string | null;
  birthdayMonth: number | null;
  birthdayDay: number | null;
}

export interface ProfileCard {
  userId: string;
  /** Nom d'affichage s'il est visible pour moi, sinon nom du compte. */
  name: string;
  image: string | null;
  accountType: string;
  /** Entreprise et poste d'un employe : visibles de tout utilisateur connecte. */
  organization: { id: string; name: string } | null;
  jobTitle: string | null;
  /** `null` : rien de public a montrer (profil prive, hors de ma portee, ou desactive par l'entreprise). */
  profile: PublicProfileFields | null;
  isSelf: boolean;
}

const cache = new Map<string, ProfileCard | null>();

/**
 * Fiche d'une personne lue sur Compte, avec le compte de l'app (cookies + `expect`), chargee seulement quand `enabled`.
 * `undefined` : pas (encore) de fiche ; echec, personne inconnue ou hors d'un `PresenceProvider` : on n'affiche simplement rien de plus.
 */
export function useProfileCard(userId: string | null | undefined, enabled: boolean): ProfileCard | undefined {
  const access = useCompteAccess();
  const key = access && userId ? `${access.base}|${access.userId}|${userId}` : "";
  const [card, setCard] = useState<ProfileCard | null | undefined>(() => (key ? cache.get(key) : undefined));
  useEffect(() => {
    if (!enabled || !key || !access || !userId) return undefined;
    let live = true;
    // Rafraichi a chaque ouverture : un profil modifie ou une visibilite changee doivent se voir tout de suite.
    fetch(`${access.base}/user/profiles/${encodeURIComponent(userId)}?expect=${encodeURIComponent(access.userId)}`, { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<ProfileCard>) : null))
      .catch(() => null)
      .then((c) => { cache.set(key, c); if (live) setCard(c); });
    return () => { live = false; };
  }, [enabled, key, access, userId]);
  return card ?? undefined;
}
