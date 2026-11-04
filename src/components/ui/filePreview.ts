/** Une pièce à afficher dans l'aperçu : URL lisible par le navigateur (http(s), `blob:` ou `data:`), nom et, si connus, type MIME et taille en octets. */
export interface FilePreviewItem {
  url: string;
  name: string;
  mime?: string;
  size?: number;
}

export type FilePreviewKind = "image" | "pdf" | "video" | "audio" | "text";

const IMAGE_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/avif", "image/svg+xml", "image/bmp", "image/x-icon", "image/vnd.microsoft.icon"]);
const TEXT_MIMES = new Set(["text/plain", "text/csv", "text/markdown", "text/x-markdown", "application/json", "text/x-log"]);
const BY_EXTENSION: Record<string, FilePreviewKind> = {
  jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image", avif: "image", svg: "image", bmp: "image", ico: "image",
  pdf: "pdf",
  mp4: "video", webm: "video", mov: "video", m4v: "video", ogv: "video",
  mp3: "audio", wav: "audio", ogg: "audio", oga: "audio", m4a: "audio", aac: "audio", flac: "audio", opus: "audio",
  txt: "text", md: "text", csv: "text", json: "text", log: "text",
};

/** Ce que le navigateur sait afficher pour ce fichier : `image`, `pdf`, `video`, `audio`, `text`, ou `null` (pas d'aperçu possible). Le type MIME prime, l'extension du nom sert de repli. */
export function previewKind(mime?: string | null, name?: string | null): FilePreviewKind | null {
  const type = (mime ?? "").split(";")[0].trim().toLowerCase();
  if (type) {
    if (IMAGE_MIMES.has(type)) return "image";
    if (type === "application/pdf") return "pdf";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    if (TEXT_MIMES.has(type)) return "text";
    if (type !== "application/octet-stream") return null;
  }
  const ext = (name ?? "").split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  return ext && ext !== (name ?? "").toLowerCase() ? (BY_EXTENSION[ext] ?? null) : null;
}

/** Vrai si `FilePreviewModal` peut afficher ce fichier (image, PDF, vidéo, audio, texte brut) ; sinon il propose seulement le téléchargement. */
export function canPreviewMime(mime?: string | null, name?: string | null): boolean {
  return previewKind(mime, name) !== null;
}

/** Taille lisible : `1,2 Mo` (fr) ou `1.2 MB` (en). */
export function formatFileSize(bytes: number, language = "fr"): string {
  const fr = language !== "en";
  const units = fr ? ["o", "Ko", "Mo", "Go"] : ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  const text = i === 0 ? String(Math.round(value)) : value.toFixed(value < 10 ? 1 : 0);
  return `${fr ? text.replace(".", ",") : text} ${units[i]}`;
}

/** Télécharge `item` via un lien `download` temporaire (pour une URL d'un autre site, le navigateur peut simplement l'ouvrir : l'app fournit alors `onDownload`). */
export function downloadItem(item: FilePreviewItem): void {
  const a = document.createElement("a");
  a.href = item.url;
  a.download = item.name;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
