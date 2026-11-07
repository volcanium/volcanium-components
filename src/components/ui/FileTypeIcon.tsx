import clsx from "clsx";
import {
  IconFile, IconFileMusic, IconFileSpreadsheet, IconFileText, IconFileTypeDoc, IconFileTypePdf, IconFileTypePpt, IconFileZip, IconFileCode, IconFolder, IconMail, IconPhoto, IconVideo,
  type Icon,
} from "@tabler/icons-react";

export type FileTypeKind = "folder" | "image" | "pdf" | "video" | "audio" | "text" | "document" | "spreadsheet" | "presentation" | "archive" | "code" | "email" | "file";

const BY_EXTENSION: Record<string, FileTypeKind> = {
  jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image", avif: "image", svg: "image", bmp: "image", heic: "image", ico: "image",
  pdf: "pdf", mp4: "video", webm: "video", mov: "video", m4v: "video", mkv: "video", avi: "video", mp3: "audio", wav: "audio", ogg: "audio", m4a: "audio", flac: "audio", aac: "audio",
  txt: "text", md: "text", log: "text", rtf: "text", docx: "document", doc: "document", odt: "document", xlsx: "spreadsheet", xls: "spreadsheet", ods: "spreadsheet", csv: "spreadsheet",
  pptx: "presentation", ppt: "presentation", odp: "presentation", zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive",
  js: "code", ts: "code", tsx: "code", jsx: "code", json: "code", html: "code", css: "code", py: "code", java: "code", sh: "code", xml: "code", yml: "code", yaml: "code", eml: "email", msg: "email",
};

/** Famille d'un fichier d'après son type MIME, sinon l'extension de son nom. */
export function fileTypeKind(mime?: string | null, name?: string | null): FileTypeKind {
  const type = (mime ?? "").split(";")[0].trim().toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf") return "pdf";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type === "message/rfc822") return "email";
  const ext = (name ?? "").includes(".") ? (name ?? "").split(".").pop()?.toLowerCase() : undefined;
  return (ext && BY_EXTENSION[ext]) || (type.startsWith("text/") ? "text" : "file");
}

const ICONS: Record<FileTypeKind, { icon: Icon; color: string }> = {
  folder: { icon: IconFolder, color: "text-vc-main" },
  image: { icon: IconPhoto, color: "text-vc-success" },
  pdf: { icon: IconFileTypePdf, color: "text-vc-danger" },
  video: { icon: IconVideo, color: "text-vc-warning" },
  audio: { icon: IconFileMusic, color: "text-vc-warning" },
  text: { icon: IconFileText, color: "text-vc-text/70" },
  document: { icon: IconFileTypeDoc, color: "text-vc-main" },
  spreadsheet: { icon: IconFileSpreadsheet, color: "text-vc-success" },
  presentation: { icon: IconFileTypePpt, color: "text-vc-warning" },
  archive: { icon: IconFileZip, color: "text-vc-text/70" },
  code: { icon: IconFileCode, color: "text-vc-text/70" },
  email: { icon: IconMail, color: "text-vc-main" },
  file: { icon: IconFile, color: "text-vc-text/60" },
};

export interface FileTypeIconProps {
  /** `folder` pour un dossier ; sinon la famille est déduite de `mime` et `name`. */
  kind?: "folder" | "file";
  mime?: string | null;
  name?: string | null;
  /** Taille en pixels. @default 20 */
  size?: number;
  className?: string;
}

/** Icône d'un fichier ou d'un dossier selon son type (dossier, image, PDF, vidéo, document, tableur…). Décorative : le nom du fichier est lu à côté. */
export default function FileTypeIcon({ kind = "file", mime, name, size = 20, className }: FileTypeIconProps) {
  const { icon: Glyph, color } = ICONS[kind === "folder" ? "folder" : fileTypeKind(mime, name)];
  return <Glyph size={size} stroke={1.6} aria-hidden="true" className={clsx("shrink-0", color, className)} />;
}
