import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  children: ReactNode;
}

/** Bloc de code ou de journal (chasse fixe, défilement, retour à la ligne). */
export default function CodeBlock({ children, className, ...rest }: CodeBlockProps) {
  return (
    <pre
      className={clsx(
        "rounded-lg border border-vc-line bg-vc-back/60 p-3 text-xs font-mono text-vc-text overflow-auto whitespace-pre-wrap break-all",
        className,
      )}
      {...rest}
    >
      {children}
    </pre>
  );
}
