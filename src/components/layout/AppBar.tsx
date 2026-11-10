import { useEffect, useState, type ReactNode } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import AvatarStack, { type AvatarStackPerson } from "../ui/AvatarStack";
import IconButton from "../ui/IconButton";

/** Barre du haut d'un document ou d'un tableau (Office : tableaux blancs, texte, tableur, présentations) : retour, titre, étiquette, état, personnes présentes, boutons d'action.
 *  UN SEUL composant pour que la barre soit identique partout. Aucun texte en dur : les libellés passent en props. */
const RING = ["#e8590c", "#1971c2", "#2f9e44", "#9c36b5", "#c2255c", "#0c8599", "#e67700", "#5f3dc4", "#d6336c", "#2b8a3e"];
/** Couleur stable d'une personne (même personne = même couleur partout) : l'anneau de son avatar quand l'appelant n'en donne pas. */
export function ringColorOf(id: string): string {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return RING[h % RING.length]!;
}
export type AppBarPerson = AvatarStackPerson;

/** Titre : champ discret (bordure au survol), Entrée/blur = enregistrer, Échap = annuler. Sans droit de renommer : simple texte. `suffix` = extension, affichée à part. */
export function AppBarTitle({ title, canRename, onRename, label, suffix, untitled, onFocusChange }: {
  title: string; canRename: boolean; onRename: (title: string) => void; label: string; suffix?: string; untitled?: string; onFocusChange?: (focused: boolean) => void;
}) {
  const [draft, setDraft] = useState(title);
  useEffect(() => setDraft(title), [title]);
  const commit = () => { const v = draft.trim(); if (!v) setDraft(title); else if (v !== title) onRename(v.slice(0, 120)); };
  if (!canRename) return <h1 className="min-w-0 flex-1 truncate px-2 text-sm font-semibold">{(title || untitled || "") + (suffix ?? "")}</h1>;
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <input
        style={suffix ? { width: `${Math.min(Math.max(draft.length, 4) + 2, 60)}ch` } : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => { onFocusChange?.(false); commit(); }}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { setDraft(title); (e.target as HTMLInputElement).blur(); } }}
        maxLength={120}
        aria-label={label}
        className={`min-w-0 ${suffix ? "max-w-full" : "flex-1"} rounded-md border border-transparent bg-transparent px-2 py-1 text-base font-semibold outline-none hover:border-vc-line focus:border-vc-main/60 focus:bg-vc-container sm:text-sm`}
      />
      {suffix && <span className="shrink-0 pr-2 text-sm font-semibold opacity-50">{suffix}</span>}
      {suffix && <span className="flex-1" />}
    </div>
  );
}

/** Retour, titre, étiquette, état de la connexion, personnes présentes, puis les boutons d'action (`children`, des `IconButton` de la librairie). */
export default function AppBar({ title, backLabel, onBack, tag, status, people, peopleLabel, children }: {
  title: ReactNode; backLabel: string; onBack?: () => void; tag?: ReactNode; status?: ReactNode; people?: AppBarPerson[]; peopleLabel?: string; children?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-center gap-1.5 border-b border-vc-line bg-vc-back px-2 pb-2 pt-[calc(8px+var(--vcm-top,0px))] sm:gap-2 sm:px-3">
      {onBack && <IconButton label={backLabel} onClick={onBack}><IconArrowLeft size={16} /></IconButton>}
      {title}
      {tag}
      {status && <span className="text-xs" role="status" aria-live="polite">{status}</span>}
      {people && people.length > 0 && <div className="max-sm:hidden"><AvatarStack people={people.map((p) => ({ ...p, color: p.color ?? ringColorOf(p.id) }))} label={peopleLabel ?? ""} /></div>}
      {children}
    </header>
  );
}
