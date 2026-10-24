import { useState } from "react";
import { IconTrash, IconUpload, IconUser } from "@tabler/icons-react";
import { useI18n } from "./host";

interface Props {
  /** Photo affichee (`null` = initiales). */
  url: string | null;
  onFile: (file: File) => void;
  onRemove: () => void;
  /** Volcanium Cloud n'est pas configure : la photo ne se choisit pas (l'image reste affichee, sans survol). */
  disabled?: boolean;
}

/**
 * Photo de profil d'un contact, comme dans Volcanium Compte : on clique (ou on glisse un fichier) sur le rond, et au survol une icone d'envoi le recouvre.
 * Pas de bouton a part ; seule la suppression est un petit lien quand il y a une photo.
 */
export default function PhotoPicker({ url, onFile, onRemove, disabled = false }: Props) {
  const { t } = useI18n();
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const active = (hover || dragging) && !disabled;
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <label
        aria-label={t("contacts.photo.edit")}
        title={disabled ? undefined : t("contacts.photo.edit")}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragOver={(e) => { if (disabled) return; e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f && !disabled) onFile(f); }}
        className={`relative block size-24 overflow-hidden rounded-full bg-vc-back focus-within:ring-2 focus-within:ring-vc-main/50 ${disabled ? "" : "cursor-pointer"}`}
      >
        {url ? <img src={url} alt="" className="size-full object-cover" /> : <span aria-hidden className="flex size-full items-center justify-center bg-vc-veil-strong text-vc-text-secondary"><IconUser size={44} stroke={1.5} /></span>}
        <span aria-hidden className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}>
          <IconUpload className="size-8 text-white" />
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={disabled} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
      </label>
      {url && !disabled && (
        <button type="button" onClick={onRemove} className="flex cursor-pointer items-center gap-1 text-xs text-vc-text/60 hover:text-vc-danger">
          <IconTrash size={12} aria-hidden />{t("contacts.photo.remove")}
        </button>
      )}
    </div>
  );
}
