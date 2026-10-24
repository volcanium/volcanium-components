import { useEffect, useMemo, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { IconButton } from "./ui";
import { useI18n } from "./host";
import { dayKey, monthGrid } from "./time";

/** Mini-calendrier de la barre laterale : un mois, fleches haut/bas pour changer de mois, clic sur un jour pour y aller ; la periode affichee est surlignee. */
export default function MiniMonth({ cursor, highlight, onPick }: { cursor: Date; highlight: ReadonlySet<string>; onPick: (d: Date) => void }) {
  const { t, locale } = useI18n();
  const [shown, setShown] = useState(() => new Date(cursor.getFullYear(), cursor.getMonth(), 1));
  useEffect(() => { setShown(new Date(cursor.getFullYear(), cursor.getMonth(), 1)); }, [cursor]);
  const days = useMemo(() => monthGrid(shown), [shown]);
  const weekdays = useMemo(() => days.slice(0, 7).map((d) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d)), [days, locale]);
  const todayKey = dayKey(new Date());
  const move = (n: number) => setShown((s) => new Date(s.getFullYear(), s.getMonth() + n, 1));
  return (
    <div className="select-none text-xs">
      <div className="mb-1 flex items-center justify-between">
        <span className="px-1 text-sm font-semibold capitalize">{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(shown)}</span>
        <span className="flex">
          <IconButton size="sm" label={t("cal.prev")} onClick={() => move(-1)}><IconChevronUp size={14} /></IconButton>
          <IconButton size="sm" label={t("cal.next")} onClick={() => move(1)}><IconChevronDown size={14} /></IconButton>
        </span>
      </div>
      <div className="grid grid-cols-7 text-center text-vc-text-secondary">{weekdays.map((w, i) => <span key={i} className="py-0.5 uppercase">{w}</span>)}</div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = dayKey(d);
          const inMonth = d.getMonth() === shown.getMonth();
          const today = key === todayKey;
          return (
            <button key={key} type="button" onClick={() => onPick(d)} aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(d)} aria-current={today ? "date" : undefined}
              className={`m-px flex h-7 items-center justify-center rounded text-xs ${today ? "bg-vc-main font-semibold text-white" : highlight.has(key) ? "bg-vc-veil-strong" : "hover:bg-vc-veil"} ${!inMonth && !today ? "text-vc-text-secondary/60" : ""}`}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
