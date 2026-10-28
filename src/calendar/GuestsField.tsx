import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Chip } from "./ui";
import { useI18n } from "./host";
import { isEmail } from "./eventForm";

export interface Guest { email: string; name: string }

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

interface GuestsFieldProps {
  label: string;
  guests: Guest[];
  onChange: (guests: Guest[]) => void;
  /** Collegues proposes pendant la saisie (nom ou adresse). */
  members: readonly { email: string; name: string }[];
  /** Texte en cours de saisie : remonte au parent, qui l'ajoute a l'enregistrement s'il est une adresse valide. */
  draft: string;
  onDraftChange: (value: string) => void;
  invalid: boolean;
  onInvalidChange: (invalid: boolean) => void;
}

/** Invites comme les destinataires d'un mail : puces (avec croix) dans le champ, suggestions seulement pendant la saisie, adresse libre acceptee. */
export default function GuestsField({ label, guests, onChange, members, draft, onDraftChange, invalid, onInvalidChange }: GuestsFieldProps) {
  const { t } = useI18n();
  const id = useId();
  const listId = `${id}-suggestions`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);

  const q = draft.trim();
  const suggestions = useMemo(() => {
    if (!focused || !q || q.includes(",") || q.includes(";")) return [];
    const needle = norm(q);
    const taken = new Set(guests.map((g) => g.email));
    return members.filter((m) => !taken.has(m.email.toLowerCase()) && norm(`${m.name} ${m.email}`).includes(needle)).slice(0, 8);
  }, [members, guests, focused, q]);

  const add = (email: string, name: string) => {
    const e = email.trim().toLowerCase();
    if (!guests.some((g) => g.email === e)) onChange([...guests, { email: e, name }]);
    onDraftChange("");
    onInvalidChange(false);
    setActive(0);
  };
  const nameOf = (email: string) => members.find((m) => m.email.toLowerCase() === email)?.name ?? "";

  /** Valide ce qui est tape (virgule, point-virgule, Entree, sortie du champ) ; `false` si l'adresse est invalide. */
  const commit = (text: string): boolean => {
    const parts = text.split(/[,;\n]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    if (parts.length === 0) return true;
    const bad = parts.filter((p) => !isEmail(p));
    const next = [...guests];
    for (const p of parts) if (isEmail(p) && !next.some((g) => g.email === p)) next.push({ email: p, name: nameOf(p) });
    if (next.length !== guests.length) onChange(next);
    onDraftChange(bad.join(", "));
    onInvalidChange(bad.length > 0);
    return bad.length === 0;
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setActive((i) => (e.key === "ArrowDown" ? (i + 1) % suggestions.length : (i - 1 + suggestions.length) % suggestions.length));
    } else if ((e.key === "Enter" || e.key === "Tab") && suggestions[active]) {
      e.preventDefault();
      add(suggestions[active]!.email, suggestions[active]!.name);
    } else if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Escape" && suggestions.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setFocused(false);
    } else if (e.key === "Backspace" && draft === "" && guests.length > 0) {
      onChange(guests.slice(0, -1));
    }
  };

  return (
    <div className="relative">
      <div onClick={() => inputRef.current?.focus()} className={`flex min-h-11 cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-vc-container px-2 py-1.5 focus-within:border-vc-main ${invalid ? "border-vc-danger" : "border-vc-line"}`}>
        {guests.map((g) => <Chip key={g.email} removeLabel={t("cal.event.guests.remove", { email: g.email })} onRemove={() => onChange(guests.filter((x) => x.email !== g.email))}>{g.name || g.email}</Chip>)}
        <input
          ref={inputRef}
          id={id}
          value={draft}
          onChange={(e) => { onDraftChange(e.target.value); setActive(0); setFocused(true); if (invalid) onInvalidChange(false); }}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); commit(draft); }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/[,;\n]/.test(text)) { e.preventDefault(); commit(draft + text); }
          }}
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={label}
          aria-invalid={invalid}
          {...(suggestions[active] ? { "aria-activedescendant": `${listId}-${active}` } : {})}
          placeholder={guests.length === 0 ? label : ""}
          inputMode="email"
          autoComplete="off"
          spellCheck={false}
          className="min-w-40 flex-1 bg-transparent py-1 text-sm text-vc-text outline-none"
        />
      </div>
      {suggestions.length > 0 && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-vc-line-strong bg-vc-container py-1 shadow-lg">
          {suggestions.map((m, i) => (
            <li key={m.email} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              {/* mousedown (pas click) : le champ garde le focus, donc ne valide pas le texte tape avant le choix */}
              <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); add(m.email, m.name); }} onMouseEnter={() => setActive(i)} className={`flex w-full cursor-pointer flex-col px-3 py-2 text-left ${i === active ? "bg-vc-veil" : ""}`}>
                <span className="truncate text-sm font-medium text-vc-text">{m.name || m.email}</span>
                {m.name && <span className="truncate text-xs text-vc-text-secondary">{m.email}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
