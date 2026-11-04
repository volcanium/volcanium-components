import { useState } from "react";
import { IconChevronDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { DatePicker, IconButton } from "./ui";
import { useI18n } from "./host";

/** Titre cliquable de la periode : ouvre un selecteur annee + mois pour se deplacer loin dans le temps en deux clics. */
export default function JumpPicker({ title, cursor, onPick }: { title: string; cursor: Date; onPick: (monthStart: Date) => void }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(cursor.getFullYear());
  const pickerLang = locale.toLowerCase().startsWith("en") ? "en" : locale.toLowerCase().startsWith("es") ? "es" : "fr";
  const toggle = () => { setYear(cursor.getFullYear()); setOpen((o) => !o); };
  return (
    <div className="relative">
      <button type="button" onClick={toggle} aria-haspopup="dialog" aria-expanded={open} title={t("cal.jump")} className="flex items-center gap-1 rounded px-1 text-lg font-semibold capitalize hover:bg-vc-veil">
        {title}<IconChevronDown size={16} aria-hidden className="text-vc-text-secondary" />
      </button>
      {open && (
        <>
          <button type="button" aria-label={t("cal.event.close")} className="fixed inset-0 z-20 cursor-default" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label={t("cal.jump")} className="absolute start-0 top-full z-30 mt-1 w-64 rounded-lg border border-vc-line bg-vc-container p-3 shadow-lg">
            <div className="mb-3">
              {/* Saisie directe : taper une date (jj/mm/aaaa) deplace le calendrier a ce jour, sans passer par annee puis mois. */}
              <DatePicker
                label={t("cal.jump.typed")}
                placeholder={t("cal.jump.typed.placeholder")}
                language={pickerLang}
                value={null}
                onChange={(iso) => {
                  if (!iso) return;
                  const [y, m, d] = iso.split("-").map(Number);
                  onPick(new Date(y, m - 1, d));
                  setOpen(false);
                }}
              />
            </div>
            <div className="mb-2 flex items-center justify-between">
              <IconButton size="sm" label={t("cal.prev")} onClick={() => setYear((y) => y - 1)}><IconChevronLeft size={16} /></IconButton>
              <span className="text-sm font-semibold">{year}</span>
              <IconButton size="sm" label={t("cal.next")} onClick={() => setYear((y) => y + 1)}><IconChevronRight size={16} /></IconButton>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }, (_, m) => {
                const d = new Date(year, m, 1);
                const current = year === cursor.getFullYear() && m === cursor.getMonth();
                return (
                  <button key={m} type="button" onClick={() => { onPick(d); setOpen(false); }} className={`rounded px-2 py-1.5 text-sm capitalize ${current ? "bg-vc-main text-white" : "hover:bg-vc-veil"}`}>
                    {new Intl.DateTimeFormat(locale, { month: "short" }).format(d)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
