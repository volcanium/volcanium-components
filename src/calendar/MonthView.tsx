import { useMemo, useState } from "react";
import { useI18n } from "./host";
import type { CalEvent, CalendarInfo } from "./types";
import type { Span } from "./time";
import { dayKey, eventsByDay, isMovable, monthGrid, sameTimeOnDay } from "./time";
import { cellAt, startDrag, startTouchDrag, type DragRef } from "./drag";
import EventChip from "./EventChip";

const MAX_PER_DAY = 3;

export default function MonthView({ cursor, events, calendars, drag, onDay, onEvent, onMore, onDrop }: {
  cursor: Date; events: CalEvent[]; calendars: Map<string, CalendarInfo>; drag: DragRef;
  onDay: (d: Date) => void; onEvent: (e: CalEvent) => void; onMore: (d: Date) => void; onDrop: (e: CalEvent, target: Date) => void;
}) {
  const { t, locale } = useI18n();
  const days = useMemo(() => monthGrid(cursor), [cursor]);
  const byDay = useMemo(() => eventsByDay(events, days), [events, days]);
  const [hover, setHover] = useState<string | null>(null);
  const todayKey = dayKey(new Date());
  const weekdays = useMemo(() => days.slice(0, 7).map((d) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d)), [days, locale]);
  const touchDrag = (e: React.PointerEvent<HTMLElement>, event: CalEvent, span: Span) =>
    startTouchDrag(e, {
      onMove: (x, y) => setHover(cellAt(x, y, "day")?.dataset.day ?? null),
      onDrop: (x, y) => { const d = days.find((c) => dayKey(c) === cellAt(x, y, "day")?.dataset.day); if (d) onDrop(event, sameTimeOnDay(span, d)); },
      onEnd: () => setHover(null),
    });
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-vc-line">
      <div className="grid grid-cols-7 border-b border-vc-line bg-vc-veil text-xs font-medium text-vc-text-secondary">
        {weekdays.map((w, i) => <div key={i} className="px-2 py-1.5 text-center capitalize">{w}</div>)}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {days.map((d) => {
          const key = dayKey(d);
          const list = byDay.get(key) ?? [];
          const other = d.getMonth() !== cursor.getMonth();
          return (
            <div key={key} data-day={key} role="button" tabIndex={0} aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(d)}
              onClick={() => onDay(d)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDay(d); } }}
              onDragOver={(e) => { if (drag.current) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setHover(key); } }}
              onDragLeave={() => setHover((h) => (h === key ? null : h))}
              onDrop={(e) => { e.preventDefault(); setHover(null); const s = drag.current; drag.current = null; if (s) onDrop(s.event, sameTimeOnDay(s.span, d)); }}
              className={`flex min-h-0 min-w-0 cursor-pointer flex-col gap-0.5 overflow-hidden border-b border-r border-vc-line p-1 ${hover === key ? "bg-vc-veil-strong" : other ? "bg-vc-veil/50" : ""}`}>
              <span className={`mb-0.5 self-end text-xs ${key === todayKey ? "flex size-6 items-center justify-center rounded-full bg-vc-main font-semibold text-white" : other ? "text-vc-text-secondary" : ""}`}>{d.getDate()}</span>
              {list.slice(0, MAX_PER_DAY).map(({ event, span }) => (
                <EventChip key={`${event.id}-${key}`} event={event} span={span} calendar={event.calendarId ? calendars.get(event.calendarId) : undefined} locale={locale} untitled={t("cal.untitled")} onClick={onEvent}
                  draggable={isMovable(event)} onDragStart={(e) => startDrag(e, drag, event, span)} onDragEnd={() => { drag.current = null; setHover(null); }} onPointerDown={(e) => touchDrag(e, event, span)} />
              ))}
              {list.length > MAX_PER_DAY && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onMore(d); }} className="text-start text-xs text-vc-text-secondary hover:underline">{t("cal.more", { n: list.length - MAX_PER_DAY })}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
