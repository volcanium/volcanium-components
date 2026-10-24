import { useEffect, useState, useSyncExternalStore } from "react";
import type { Contact } from "./api";
import { useContactsHost } from "./host";

/** Photo d'un contact : celle qu'on lui a choisie (meme sans adresse), sinon celle que l'hote donne pour son adresse ou son collegue, sinon ses initiales. */
export default function ContactAvatar({ contact, size = 40 }: { contact: Pick<Contact, "id" | "name" | "hasPhoto" | "emails">; size?: number }) {
  const { api, colleagues, renderAvatar } = useContactsHost();
  const [src, setSrc] = useState<string | null>(null);
  const revision = useSyncExternalStore(api.subscribePhotoChange, api.photoRevision);
  const colleague = contact.emails.map((e) => colleagues.find(e.address)).find(Boolean);
  useEffect(() => {
    let live = true;
    setSrc(null);
    if (contact.hasPhoto) void api.loadPhoto(contact.id).then((url) => live && setSrc(url));
    return () => { live = false; };
  }, [api, contact.id, contact.hasPhoto, revision]);
  return <>{renderAvatar({ name: contact.name, email: contact.emails[0]?.address, src, colleague, size })}</>;
}
