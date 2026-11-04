import { useState } from "react";
import clsx from "clsx";
import { IconFile, IconFileText, IconFileTypePdf, IconMusic, IconVideo } from "@tabler/icons-react";
import { useLanguage } from "../../utils/useLanguage";
import FilePreviewModal from "./FilePreviewModal";
import { formatFileSize, previewKind, type FilePreviewItem, type FilePreviewKind } from "./filePreview";

export interface MessageAttachmentsProps {
  /** Pièces jointes du message (URL lisibles par le navigateur). */
  items: FilePreviewItem[];
  /** Clic sur une pièce. Absent : la visionneuse intégrée (`FilePreviewModal`) s'ouvre sur ce fichier. */
  onOpen?: (item: FilePreviewItem, index: number) => void;
  /** Transmis à la visionneuse intégrée pour remplacer le téléchargement par défaut. */
  onDownload?: (item: FilePreviewItem) => void;
  className?: string;
}

const ICONS: Record<FilePreviewKind, typeof IconFile> = { image: IconFile, pdf: IconFileTypePdf, video: IconVideo, audio: IconMusic, text: IconFileText };

/**
 * Pièces jointes d'un message, à placer dans le `footer` de `MessageItem` : les images s'affichent en vignette, les autres fichiers en puce
 * (icône, nom, taille). Un clic ouvre la visionneuse plein écran sur le fichier, avec navigation entre toutes les pièces du message.
 */
export default function MessageAttachments({ items, onOpen, onDownload, className }: MessageAttachmentsProps) {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (items.length === 0) return null;
  const open = (item: FilePreviewItem, i: number) => (onOpen ? onOpen(item, i) : setOpenIndex(i));

  return (
    <>
      <div className={clsx("flex w-full flex-wrap items-start gap-2", className)}>
        {items.map((item, i) => {
          const kind = previewKind(item.mime, item.name);
          if (kind === "image") {
            return (
              <button
                key={`${item.url}-${i}`}
                type="button"
                title={item.name}
                aria-label={t("file_preview", { name: item.name })}
                onClick={() => open(item, i)}
                className="cursor-pointer overflow-hidden rounded-lg border border-vc-line-strong bg-vc-veil transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50"
              >
                <img src={item.url} alt={item.name} loading="lazy" className="block max-h-60 max-w-full object-cover max-sm:max-h-48" draggable={false} />
              </button>
            );
          }
          const Icon = (kind && ICONS[kind]) || IconFile;
          return (
            <button
              key={`${item.url}-${i}`}
              type="button"
              title={item.name}
              aria-label={t("file_preview", { name: item.name })}
              onClick={() => open(item, i)}
              className="flex max-w-full cursor-pointer items-center gap-2 rounded-lg border border-vc-line-strong bg-vc-container px-3 py-2 text-start transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50"
            >
              <Icon size={20} className="shrink-0 text-vc-text/60" aria-hidden />
              <span className="min-w-0">
                <span className="block max-w-56 truncate text-sm text-vc-text">{item.name}</span>
                {item.size !== undefined && <span className="block text-xs text-vc-text/50">{formatFileSize(item.size, language)}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {!onOpen && <FilePreviewModal open={openIndex !== null} onClose={() => setOpenIndex(null)} items={items} index={openIndex ?? 0} onIndexChange={(n) => setOpenIndex(n)} onDownload={onDownload} />}
    </>
  );
}
