import { ReactNode } from "react";
import clsx from "clsx";

export interface ListRowProps {
  /** Ligne principale (nom). */
  title: ReactNode;
  /** Précision à côté du titre, en petit et atténuée (ex. « groupe Applications »). */
  tag?: ReactNode;
  /** Ligne secondaire sous le titre, en petit. */
  subtitle?: ReactNode;
  /** Boutons à droite (souvent des `IconButton`). */
  actions?: ReactNode;
  /** Alignement vertical des actions par rapport au texte. @default "center" */
  align?: "center" | "start";
  className?: string;
}

/** Une entrée de liste en carte : titre, détail et actions. À placer dans un `<ul className="space-y-2">`. */
export default function ListRow({ title, tag, subtitle, actions, align = "center", className }: ListRowProps) {
  return (
    <li className={clsx("flex flex-wrap justify-between gap-3 rounded-lg border border-vc-line bg-vc-veil p-3", align === "start" ? "items-start" : "items-center", className)}>
      <div className="min-w-0">
        <div className="font-medium">
          {title}
          {tag && <span className="ml-2 text-xs opacity-60">{tag}</span>}
        </div>
        {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
      </div>
      {actions && <div className="flex gap-1">{actions}</div>}
    </li>
  );
}
