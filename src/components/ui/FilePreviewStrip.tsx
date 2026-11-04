import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconFile, IconFileText, IconFileTypePdf, IconMusic, IconVideo, IconX } from "@tabler/icons-react";
import { useLanguage } from "../../utils/useLanguage";
import FilePreviewModal from "./FilePreviewModal";
import { formatFileSize, previewKind, type FilePreviewItem, type FilePreviewKind } from "./filePreview";

export interface FilePreviewStripProps {
  /** Fichiers choisis, pas encore envoyés. */
  files: File[];
  /** Affiche une croix sur chaque vignette. Sans elle, les fichiers ne sont pas retirables. */
  onRemove?: (file: File, index: number) => void;
  /** Désactive les croix (envoi en cours). */
  disabled?: boolean;
  className?: string;
}

/** Garde le même tableau tant que ses éléments ne changent pas (évite de recréer les URL d'aperçu à chaque rendu du parent). */
function useStableFiles(files: File[]): File[] {
  const ref = useRef(files);
  if (ref.current.length !== files.length || ref.current.some((f, i) => f !== files[i])) ref.current = files;
  return ref.current;
}

/** Une URL d'objet par fichier ; créées dans un effet (sûr en StrictMode) et révoquées au retrait d'un fichier comme au démontage. */
function useObjectUrls(files: File[]): string[] {
  const stable = useStableFiles(files);
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const created = stable.map((f) => URL.createObjectURL(f));
    setUrls(created);
    return () => created.forEach((u) => URL.revokeObjectURL(u));
  }, [stable]);
  return urls.length === stable.length ? urls : [];
}

const ICONS: Record<FilePreviewKind, typeof IconFile> = { image: IconFile, pdf: IconFileTypePdf, video: IconVideo, audio: IconMusic, text: IconFileText };

/**
 * Bandeau de vignettes des fichiers en attente d'envoi : miniature pour les images, icône sinon, nom et taille, croix pour retirer.
 * Un clic sur une vignette ouvre `FilePreviewModal` sur ce fichier. Utilisé par `FilePicker` (`previewFiles`) et `MessageComposer` (`attachments`).
 */
export default function FilePreviewStrip({ files, onRemove, disabled = false, className }: FilePreviewStripProps) {
  const { t, language } = useLanguage();
  const urls = useObjectUrls(files);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (files.length === 0) return null;
  const items: FilePreviewItem[] = urls.length === files.length ? files.map((f, i) => ({ url: urls[i], name: f.name, mime: f.type || undefined, size: f.size })) : [];

  return (
    <>
      <ul className={clsx("flex flex-wrap gap-2", className)}>
        {files.map((file, i) => {
          const kind = previewKind(file.type, file.name);
          const Icon = (kind && ICONS[kind]) || IconFile;
          return (
            <li key={`${file.name}-${file.size}-${file.lastModified}-${i}`} className="group relative w-24">
              <button
                type="button"
                title={file.name}
                aria-label={t("file_preview", { name: file.name })}
                disabled={items.length === 0}
                onClick={() => setOpenIndex(i)}
                className="flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-vc-line-strong bg-vc-container text-start transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50"
              >
                <span className="flex h-16 w-full items-center justify-center bg-vc-veil">
                  {kind === "image" && urls[i] ? (
                    <img src={urls[i]} alt="" className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <Icon size={26} className="text-vc-text/50" aria-hidden />
                  )}
                </span>
                <span className="truncate px-1.5 pt-1 text-xs text-vc-text">{file.name}</span>
                <span className="px-1.5 pb-1 text-[10px] text-vc-text/50">{formatFileSize(file.size, language)}</span>
              </button>
              {onRemove && (
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={t("file_remove", { name: file.name })}
                  title={t("file_remove", { name: file.name })}
                  onClick={() => onRemove(file, i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-vc-line-strong bg-vc-container text-vc-text shadow-sm transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 disabled:cursor-not-allowed disabled:opacity-40 max-sm:h-7 max-sm:w-7"
                >
                  <IconX size={12} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <FilePreviewModal open={openIndex !== null && items.length > 0} onClose={() => setOpenIndex(null)} items={items} index={openIndex ?? 0} onIndexChange={(n) => setOpenIndex(n)} />
    </>
  );
}
