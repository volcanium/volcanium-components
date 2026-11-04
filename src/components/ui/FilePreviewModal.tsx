import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconDownload, IconExternalLink, IconFileOff, IconX } from "@tabler/icons-react";
import { useLanguage } from "../../utils/useLanguage";
import IconButton from "./IconButton";
import Button from "./Button";
import { downloadItem, formatFileSize, previewKind, type FilePreviewItem } from "./filePreview";

export interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  /** Fichiers parcourables avec les flèches (un seul = pas de navigation). */
  items: FilePreviewItem[];
  /** Fichier affiché (indice dans `items`). Avec `onIndexChange` il est piloté par l'app ; sans, il sert de valeur de départ. @default 0 */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Remplace le téléchargement par défaut (lien `download`) : utile quand les fichiers sont servis par une API authentifiée. */
  onDownload?: (item: FilePreviewItem) => void;
}

const TEXT_LIMIT = 200_000;

function TextPreview({ url, onFail, label }: { url: string; onFail: () => void; label: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setText(null);
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((body) => !cancelled && setText(body.length > TEXT_LIMIT ? `${body.slice(0, TEXT_LIMIT)}\n…` : body))
      .catch(() => !cancelled && onFail());
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return (
    <pre aria-label={label} className="h-full w-full overflow-auto rounded-lg border border-vc-line bg-vc-container p-4 text-start text-sm whitespace-pre-wrap break-words text-vc-text">
      {text ?? ""}
    </pre>
  );
}

/**
 * Visionneuse plein écran façon Discord : image centrée (`object-contain`), PDF, vidéo, audio ou texte brut rendus par le navigateur,
 * nom + taille, boutons Télécharger / Ouvrir l'original / Fermer, flèches ← → et Échap au clavier, navigation entre plusieurs fichiers.
 * Les types non affichables montrent « Pas d'aperçu » et un bouton Télécharger. Voir `canPreviewMime` pour savoir à l'avance.
 */
export default function FilePreviewModal({ open, onClose, items, index = 0, onIndexChange, onDownload }: FilePreviewModalProps) {
  const { t, language } = useLanguage();
  const [inner, setInner] = useState(index);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const controlled = onIndexChange !== undefined;
  const current = Math.min(Math.max(controlled ? index : inner, 0), Math.max(items.length - 1, 0));
  const item: FilePreviewItem | undefined = items[current];

  useEffect(() => {
    if (open) setInner(index);
  }, [open, index]);

  const go = (next: number) => {
    if (items.length < 2) return;
    const wrapped = (next + items.length) % items.length;
    if (controlled) onIndexChange?.(wrapped);
    else setInner(wrapped);
  };
  // Les écouteurs lisent toujours la dernière version de `go` / `onClose` sans être réattachés à chaque rendu.
  const latest = useRef({ go, onClose, current });
  latest.current = { go, onClose, current };

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const target = e.target as HTMLElement | null;
        // Dans une vidéo/audio, les flèches règlent déjà la lecture.
        if (target && (target.tagName === "VIDEO" || target.tagName === "AUDIO" || target.tagName === "INPUT")) return;
        e.preventDefault();
        latest.current.go(latest.current.current + (e.key === "ArrowRight" ? 1 : -1));
      } else if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    // Échap sur keyup en phase de capture : la visionneuse ferme seule, sans refermer en même temps une modale ouverte dessous (qui écoute keyup sur `window`).
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      latest.current.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp, true);
      document.body.style.overflow = original;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  const kind = item ? previewKind(item.mime, item.name) : null;
  const failed = !!item && failedUrl === item.url;
  const showable = kind !== null && !failed;
  const fail = () => item && setFailedUrl(item.url);
  const download = () => (item ? (onDownload ? onDownload(item) : downloadItem(item)) : undefined);
  const meta = item ? [item.size !== undefined ? formatFileSize(item.size, language) : null, items.length > 1 ? t("file_counter", { current: current + 1, total: items.length }) : null].filter(Boolean).join(" · ") : "";

  const arrow = "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-vc-line-strong bg-vc-container text-vc-text shadow-lg transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 max-sm:h-10 max-sm:w-10";

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-1000 flex flex-col bg-vc-scrim font-vc-main text-vc-text"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("file_preview", { name: item.name })}
            className="flex min-h-0 flex-1 flex-col"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <div className="mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-3xl items-center gap-3 rounded-lg border border-vc-line bg-vc-container px-3 py-2 shadow-lg">
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate text-sm font-semibold" title={item.name}>{item.name}</p>
                {meta && <p className="truncate text-xs text-vc-text/60">{meta}</p>}
              </div>
              <IconButton label={t("file_download")} onClick={download}>
                <IconDownload size={16} />
              </IconButton>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("file_open_original")}
                title={t("file_open_original")}
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-vc-line-strong transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 max-sm:h-10 max-sm:w-10 max-sm:rounded-full max-sm:border-transparent"
              >
                <IconExternalLink size={16} />
              </a>
              <IconButton ref={closeRef} label={t("close")} onClick={onClose}>
                <IconX size={16} />
              </IconButton>
            </div>

            <div
              className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:px-16"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
              }}
            >
              {items.length > 1 && (
                <>
                  <button type="button" aria-label={t("file_previous")} title={t("file_previous")} onClick={() => go(current - 1)} className={`${arrow} left-3`}>
                    <IconChevronLeft size={20} />
                  </button>
                  <button type="button" aria-label={t("file_next")} title={t("file_next")} onClick={() => go(current + 1)} className={`${arrow} right-3`}>
                    <IconChevronRight size={20} />
                  </button>
                </>
              )}

              {showable && kind === "image" && (
                <img key={item.url} src={item.url} alt={item.name} onError={fail} className="max-h-full max-w-full object-contain" draggable={false} />
              )}
              {showable && kind === "pdf" && (
                <iframe key={item.url} src={item.url} title={item.name} className="h-full w-full max-w-5xl rounded-lg border border-vc-line bg-vc-container" />
              )}
              {showable && kind === "video" && (
                <video key={item.url} src={item.url} controls autoPlay={false} onError={fail} className="max-h-full max-w-full rounded-lg bg-vc-back" />
              )}
              {showable && kind === "audio" && (
                <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-lg border border-vc-line bg-vc-container p-6">
                  <p className="max-w-full truncate text-sm font-semibold">{item.name}</p>
                  <audio key={item.url} src={item.url} controls onError={fail} className="w-full" />
                </div>
              )}
              {showable && kind === "text" && (
                <div className="h-full w-full max-w-4xl">
                  <TextPreview key={item.url} url={item.url} onFail={fail} label={item.name} />
                </div>
              )}
              {!showable && (
                <div className="flex max-w-sm flex-col items-center gap-3 rounded-lg border border-vc-line bg-vc-container p-8 text-center">
                  <IconFileOff size={40} className="text-vc-text/40" aria-hidden />
                  <p className="text-base font-semibold">{t("file_no_preview")}</p>
                  <p className="text-sm text-vc-text/60">{t("file_no_preview_hint")}</p>
                  <Button variant="primary" icon={<IconDownload size={16} />} onClick={download}>
                    {t("file_download")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
