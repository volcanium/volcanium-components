import { useMemo } from "react";
import { useI18n } from "./host";
import type { CalEvent } from "./types";
import { busyDays, dayKey, monthGrid, yearMonths } from "./time";

/** Vue annee : les douze mois, un point sous chaque jour qui porte un evenement ; clic sur un jour = sa semaine, sur un mois = ce mois. */
export default function YearView({ year, events, onDay, onMonth }: { year: number; events: CalEvent[]; onDay: (d: Date) => void; onMonth: (m: Date) => void }) {
  const { locale } = useI18n();
  const busy = useMemo(() => busyDays(events), [events]);
  const months = useMemo(() => yearMonths(year), [year]);
  const todayKey = dayKey(new Date());
  const weekdays = useMemo(() => monthGrid(months[0]!).slice(0, 7).map((d) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d)), [months, locale]);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {months.map((m) => (
          <section key={m.getMonth()} className="rounded-lg border border-vc-line p-3">
            <button type="button" onClick={() => onMonth(m)} className="mb-2 text-sm font-semibold capitalize hover:underline">{new Intl.DateTimeFormat(locale, { month: "long" }).format(m)}</button>
            <div className="grid grid-cols-7 text-center text-[10px] uppercase text-vc-text-secondary">{weekdays.map((w, i) => <span key={i}>{w}</span>)}</div>
            <div className="grid grid-cols-7">
              {monthGrid(m).map((d) => {
                const key = dayKey(d);
                if (d.getMonth() !== m.getMonth()) return <span key={key} />;
                const today = key === todayKey;
                return (
                  <button key={key} type="button" onClick={() => onDay(d)} aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(d)} aria-current={today ? "date" : undefined}
                    className={`relative m-px flex h-8 flex-col items-center justify-center rounded text-xs ${today ? "bg-vc-main font-semibold text-white" : "hover:bg-vc-veil"}`}>
                    {d.getDate()}
                    {busy.has(key) && <span aria-hidden className={`absolute bottom-0.5 size-1 rounded-full ${today ? "bg-white" : "bg-vc-main"}`} />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
