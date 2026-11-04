import { ReactNode, useRef } from "react";
import Button from "./Button";
import FilePreviewStrip from "./FilePreviewStrip";

export interface FilePickerProps {
  /** Texte du bouton. */
  children: ReactNode;
  /** Appelée avec le fichier choisi (le champ est remis à zéro, on peut rechoisir le même). Avec `multiple`, appelée une fois par fichier. */
  onPick: (file: File) => void;
  /** Autorise plusieurs fichiers d'un coup (ex. pièces jointes). @default false */
  multiple?: boolean;
  /** Types acceptés (ex. « .zip »). */
  accept?: string;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "accent" | "secondary" | "dangerous" | "discret" | "tertiary" | "lum";
  /** Nom accessible du champ fichier. */
  label?: string;
  /** Fichiers déjà choisis et en attente d'envoi (la liste que l'app tient à jour via `onPick`) : un aperçu s'affiche sous le bouton (miniature pour les images, icône sinon ; un clic ouvre la visionneuse). */
  previewFiles?: File[];
  /** Avec `previewFiles` : retire un fichier de la liste (affiche une croix sur chaque vignette). */
  onRemoveFile?: (file: File, index: number) => void;
}

/** Bouton qui ouvre le sélecteur de fichier du navigateur (le champ natif reste caché). */
export default function FilePicker({ children, onPick, multiple, accept, icon, disabled, loading, variant, label, previewFiles, onRemoveFile }: FilePickerProps) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button variant={variant} icon={icon} disabled={disabled} loading={loading} onClick={() => input.current?.click()}>
        {children}
      </Button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        aria-label={label}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          for (const file of multiple ? files : files.slice(0, 1)) onPick(file);
        }}
      />
      {previewFiles && previewFiles.length > 0 && <FilePreviewStrip files={previewFiles} onRemove={onRemoveFile} disabled={disabled || loading} className="mt-3 w-full basis-full" />}
    </>
  );
}
