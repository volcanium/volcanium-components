import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "./host";
import type { CalEvent, CalendarInfo } from "./types";
import type { Span } from "./time";
import { atMinutes, dayKey, eventsByDay, isMovable, layoutDay, minutesNow, sameTimeOnDay, snapMinutes, startOfDay, weekDays } from "./time";
import { cellAt, startDrag, startTouchDrag, type DragRef } from "./drag";
import EventChip, { timeFormat } from "./EventChip";

const HOUR = 48; // pixels par heure

export default function WeekView({ cursor, events, calendars, drag, onSlot, onEvent, onDrop }: {
  cursor: Date; events: CalEvent[]; calendars: Map<string, CalendarInfo>; drag: DragRef;
  onSlot: (d: Date) => void; onEvent: (e: CalEvent) => void; onDrop: (e: CalEvent, target: Date) => void;
}) {
  const { t, locale } = useI18n();
  const days = useMemo(() => weekDays(cursor), [cursor]);
  const byDay = useMemo(() => eventsByDay(events, days), [events, days]);
  const scroller = useRef<HTMLDivElement>(null);
  const outer = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());
  const [ghost, setGhost] = useState<{ key: string; minutes: number } | null>(null);
  const todayKey = dayKey(now);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(id); }, []);
  // Heure courante en haut ; telephone : c'est le conteneur exterieur qui defile (dans les deux sens), et la colonne d'aujourd'hui vient se placer a cote des heures.
  useEffect(() => {
    const top = Math.max(0, (Math.min(minutesNow() / 60, 18) - 1.5) * HOUR);
    if (scroller.current) scroller.current.scrollTop = top;
    const box = outer.current;
    if (!box) return;
    box.scrollTop = top;
    const col = box.querySelector<HTMLElement>("[data-today]");
    box.scrollLeft = box.scrollWidth > box.clientWidth && col ? Math.max(0, col.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft - 56) : 0;
  }, [cursor]);
  // Doigt : meme resultat que le glisser-deposer, calcule depuis la position du doigt (colonne sous le doigt, minute selon ou l'evenement a ete saisi).
  const touchDrag = (e: React.PointerEvent<HTMLElement>, event: CalEvent, span: Span) => {
    const grab = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const dayOf = (key: string | undefined) => days.find((d) => dayKey(d) === key);
    const spot = (x: number, y: number) => {
      if (span.allDay) { const d = dayOf(cellAt(x, y, "allday")?.dataset.allday); return d ? { key: dayKey(d), d, minutes: 0 } : null; }
      const col = cellAt(x, y, "col"); const d = dayOf(col?.dataset.col);
      return col && d ? { key: dayKey(d), d, minutes: snapMinutes((((y - col.getBoundingClientRect().top) - grab) / HOUR) * 60) } : null;
    };
    startTouchDrag(e, {
      onMove: (x, y) => { const s = spot(x, y); setGhost(s && !span.allDay ? { key: s.key, minutes: s.minutes } : null); },
      onDrop: (x, y) => { const s = spot(x, y); if (s) onDrop(event, span.allDay ? sameTimeOnDay(span, s.d) : atMinutes(s.d, s.minutes)); },
      onEnd: () => setGhost(null),
    });
  };
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const hourLabel = (h: number) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(2000, 0, 1, h));
  const anyAllDay = days.some((d) => (byDay.get(dayKey(d)) ?? []).some((x) => x.span.allDay));
  const nowTop = (minutesNow(now) * HOUR) / 60;
  const showNow = days.some((d) => dayKey(d) === todayKey);
  return (
    <div ref={outer} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-vc-line max-sm:overflow-auto">
      {/* Telephone : 7 jours ne tiennent pas, la semaine defile dans les deux sens ; en-tete (et journee entiere) collees en haut, heures collees a gauche. */}
      <div className="shrink-0 bg-vc-back max-sm:sticky max-sm:top-0 max-sm:z-30 max-sm:min-w-[46rem]">
      <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-vc-line bg-vc-veil text-xs">
        <div className="max-sm:sticky max-sm:left-0 max-sm:z-20 max-sm:bg-vc-back max-sm:shadow-[inset_0_0_0_100vmax_var(--color-vc-veil)]" />
        {days.map((d) => {
          const today = dayKey(d) === todayKey;
          return (
            <div key={dayKey(d)} data-today={today ? "" : undefined} className={`flex flex-col items-center px-2 py-1.5 ${today ? "text-vc-main" : "text-vc-text-secondary"}`}>
              <span className="capitalize">{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d)}</span>
              <span className={`mt-0.5 flex size-7 items-center justify-center rounded-full text-sm ${today ? "bg-vc-main font-semibold text-white" : "text-vc-text"}`}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>
      {anyAllDay && (
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-vc-line bg-vc-back">
          <div className="px-1 py-1 text-end max-sm:sticky max-sm:left-0 max-sm:z-20 max-sm:bg-vc-back text-[10px] text-vc-text-secondary">{t("cal.allDay")}</div>
          {days.map((d) => (
            <div key={dayKey(d)} data-allday={dayKey(d)} className="flex min-w-0 flex-col gap-0.5 border-l border-vc-line p-0.5"
              onDragOver={(e) => { if (drag.current?.span.allDay) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; } }}
              onDrop={(e) => { e.preventDefault(); const s = drag.current; drag.current = null; if (s?.span.allDay) onDrop(s.event, sameTimeOnDay(s.span, d)); }}>
              {(byDay.get(dayKey(d)) ?? []).filter((x) => x.span.allDay).map(({ event, span }) => (
                <EventChip key={event.id} event={event} span={span} calendar={event.calendarId ? calendars.get(event.calendarId) : undefined} locale={locale} untitled={t("cal.untitled")} onClick={onEvent}
                  draggable={isMovable(event)} onDragStart={(e) => startDrag(e, drag, event, span)} onDragEnd={() => { drag.current = null; setGhost(null); }} onPointerDown={(e) => touchDrag(e, event, span)} />
              ))}
            </div>
          ))}
        </div>
      )}
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto max-sm:min-w-[46rem] max-sm:flex-none max-sm:overflow-visible">
        <div className="relative grid grid-cols-[3.5rem_repeat(7,1fr)]" style={{ height: 24 * HOUR }}>
          <div className="max-sm:sticky max-sm:left-0 max-sm:z-20 max-sm:bg-vc-back">
            {hours.map((h) => <div key={h} className="pe-1 text-end text-[10px] text-vc-text-secondary" style={{ height: HOUR }}><span className="relative -top-1.5">{h === 0 ? "" : hourLabel(h)}</span></div>)}
          </div>
          {days.map((d) => {
            const key = dayKey(d);
            const items = byDay.get(key) ?? [];
            const placed = layoutDay(items, d);
            // `grab` est lu AVANT que le depot ne vide `drag.current` : le depot doit tenir compte de l'endroit ou l'evenement a ete saisi, comme l'apercu.
            const minutesAt = (e: React.DragEvent<HTMLElement>, grab: number) => snapMinutes((((e.clientY - e.currentTarget.getBoundingClientRect().top) - grab) / HOUR) * 60);
            return (
              <div key={key} data-col={key} className={`relative border-l border-vc-line ${key === todayKey ? "bg-vc-main/5" : ""}`} onClick={() => onSlot(d)}
                onDragOver={(e) => { const s = drag.current; if (s && !s.span.allDay) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setGhost({ key, minutes: minutesAt(e, s.grabPx) }); } }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setGhost((g) => (g?.key === key ? null : g)); }}
                onDrop={(e) => { e.preventDefault(); const s = drag.current; drag.current = null; setGhost(null); if (s && !s.span.allDay) onDrop(s.event, atMinutes(d, minutesAt(e, s.grabPx))); }}>
                {hours.map((h) => <div key={h} className="border-t border-vc-line/60" style={{ height: HOUR }} />)}
                {placed.map((p) => {
                  const item = items.find((x) => x.event.id === p.event.id)!;
                  return (
                    <EventChip key={p.event.id} event={p.event} span={item.span} calendar={p.event.calendarId ? calendars.get(p.event.calendarId) : undefined} locale={locale} untitled={t("cal.untitled")} onClick={onEvent}
                      draggable={isMovable(p.event)} onDragStart={(e) => startDrag(e, drag, p.event, item.span)} onDragEnd={() => { drag.current = null; setGhost(null); }} onPointerDown={(e) => touchDrag(e, p.event, item.span)}
                      className="absolute !whitespace-normal" style={{ top: (p.top * HOUR) / 60, height: Math.max(18, (p.height * HOUR) / 60 - 2), left: `${(p.column / p.columns) * 100}%`, width: `calc(${(100 * p.span) / p.columns}% - 2px)` }} />
                  );
                })}
                {ghost?.key === key && (
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-dashed border-vc-main" style={{ top: (ghost.minutes * HOUR) / 60 }}>
                    <span className="absolute -top-3 end-1 rounded bg-vc-main px-1 text-[10px] text-white">{timeFormat(locale, atMinutes(startOfDay(d), ghost.minutes))}</span>
                  </div>
                )}
                {key === todayKey && <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowTop }}><span className="-ms-1 size-2.5 rounded-full bg-vc-main" /><span className="h-0.5 flex-1 bg-vc-main" /></div>}
              </div>
            );
          })}
          {showNow && (
            <>
              {/* Ligne pointillee sur toute la largeur de la grille + heure dans la marge, comme un agenda de bureau */}
              <div aria-hidden className="pointer-events-none absolute z-10 border-t border-dashed border-vc-main/60" style={{ top: nowTop, left: "3.5rem", right: 0 }} />
              <span aria-hidden className="pointer-events-none absolute z-10 -translate-y-1/2 rounded bg-vc-main px-1 text-[10px] font-medium text-white" style={{ top: nowTop, left: 2 }}>{timeFormat(locale, now)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
