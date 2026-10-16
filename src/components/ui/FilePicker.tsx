import { ReactNode, useRef } from "react";
import Button from "./Button";

export interface FilePickerProps {
  /** Texte du bouton. */
  children: ReactNode;
  /** Appelée avec le fichier choisi (le champ est remis à zéro, on peut rechoisir le même). */
  onPick: (file: File) => void;
  /** Types acceptés (ex. « .zip »). */
  accept?: string;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "accent" | "secondary" | "dangerous" | "discret" | "tertiary" | "lum";
  /** Nom accessible du champ fichier. */
  label?: string;
}

/** Bouton qui ouvre le sélecteur de fichier du navigateur (le champ natif reste caché). */
export default function FilePicker({ children, onPick, accept, icon, disabled, loading, variant, label }: FilePickerProps) {
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
        hidden
        aria-label={label}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
}
