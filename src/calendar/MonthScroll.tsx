import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "./host";
import type { CalEvent, CalendarInfo } from "./types";
import { addDays, dayKey, eventsByDay, isMovable, sameTimeOnDay, type Span } from "./time";
import { cellAt, startTouchDrag } from "./drag";
import EventChip from "./EventChip";

const MAX_PER_DAY = 3;
const EDGE = 320; // px du bord a partir desquels on charge des semaines de plus

/** Premier jour de la grille : le lundi de la semaine qui contient le 1er du mois. */
export const gridStart = (month: Date) => { const f = new Date(month.getFullYear(), month.getMonth(), 1); return addDays(f, -((f.getDay() + 6) % 7)); };

/** Jours affiches : de `before` mois avant a `after` mois apres le mois du curseur, par semaines entieres. */
export function scrollDays(cursor: Date, before: number, after: number): Date[] {
  const start = gridStart(new Date(cursor.getFullYear(), cursor.getMonth() - before, 1));
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + after + 1, 1);
  const out: Date[] = [];
  for (let d = start; d < end || out.length % 7 !== 0; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Vue mois des ecrans courts, comme l'agenda d'iOS : les semaines defilent sans fin (jours hauts, evenements lisibles) ; le titre suit le mois a l'ecran. */
export default function MonthScroll({ cursor, navId, days, events, calendars, onDay, onEvent, onMore, onDrop, onVisibleMonth, onNeedBefore, onNeedAfter }: {
  cursor: Date; /** Change a chaque navigation voulue (fleches, saut, aujourd'hui, retour a cette vue) : la semaine du 1er vient alors en haut. */ navId: number; days: Date[]; events: CalEvent[]; calendars: Map<string, CalendarInfo>;
  onDay: (d: Date) => void; onEvent: (e: CalEvent) => void; onMore: (d: Date) => void; onDrop: (e: CalEvent, target: Date) => void;
  onVisibleMonth: (m: Date) => void; onNeedBefore: () => void; onNeedAfter: () => void;
}) {
  const { t, locale } = useI18n();
  const byDay = useMemo(() => eventsByDay(events, days), [events, days]);
  const weeks = useMemo(() => Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7)), [days]);
  const weekdays = useMemo(() => weeks[0]!.map((d) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d)), [weeks, locale]);
  const scroller = useRef<HTMLDivElement>(null);
  const todayKey = dayKey(new Date());
  const firstKey = dayKey(days[0]!);
  const pendingHeight = useRef(0); // hauteur avant d'ajouter des semaines au-dessus : on la retranche pour que l'ecran ne saute pas
  const loadingBefore = useRef(false);
  const loadingAfter = useRef(false);
  const lastNav = useRef(-1);

  // Mois choisi (fleches, saut, « aujourd'hui ») : la semaine du 1er vient en haut.
  useLayoutEffect(() => {
    const box = scroller.current;
    if (!box || lastNav.current === navId) return;
    const row = box.querySelector<HTMLElement>(`[data-week="${dayKey(gridStart(cursor))}"]`);
    if (!row) return;
    lastNav.current = navId;
    box.scrollTop = row.offsetTop;
  }, [navId, cursor, days]);

  // Semaines ajoutees au-dessus : meme position a l'ecran.
  useLayoutEffect(() => {
    const box = scroller.current;
    if (box && pendingHeight.current) { box.scrollTop += box.scrollHeight - pendingHeight.current; pendingHeight.current = 0; }
    loadingBefore.current = false;
  }, [firstKey]);
  useLayoutEffect(() => { loadingAfter.current = false; }, [days.length]);

  const onScroll = useCallback(() => {
    const box = scroller.current;
    if (!box) return;
    const rows = box.querySelectorAll<HTMLElement>("[data-week]");
    const rowH = rows[0]?.offsetHeight || 112;
    // Le mois d'une semaine est celui de son jeudi (comme les semaines ISO) : le titre ne vacille pas entre deux mois.
    const idx = Math.min(rows.length - 1, Math.max(0, Math.round(box.scrollTop / rowH) + 1));
    const thursday = addDays(weeks[idx]![0]!, 3);
    onVisibleMonth(new Date(thursday.getFullYear(), thursday.getMonth(), 1));
    if (box.scrollTop < EDGE && !loadingBefore.current) { loadingBefore.current = true; pendingHeight.current = box.scrollHeight; onNeedBefore(); }
    if (box.scrollHeight - box.scrollTop - box.clientHeight < EDGE && !loadingAfter.current) { loadingAfter.current = true; onNeedAfter(); }
  }, [weeks, onVisibleMonth, onNeedBefore, onNeedAfter]);

  const [hover, setHover] = useState<string | null>(null);
  // Appui long puis glisser au doigt ; pres du haut ou du bas de la liste, les semaines defilent.
  const touchDrag = (e: React.PointerEvent<HTMLElement>, event: CalEvent, span: Span) =>
    startTouchDrag(e, {
      onMove: (x, y) => {
        setHover(cellAt(x, y, "day")?.dataset.day ?? null);
        const box = scroller.current?.getBoundingClientRect();
        if (box && scroller.current) { if (y < box.top + 48) scroller.current.scrollTop -= 14; else if (y > box.bottom - 48) scroller.current.scrollTop += 14; }
      },
      onDrop: (x, y) => { const d = days.find((c) => dayKey(c) === cellAt(x, y, "day")?.dataset.day); if (d) onDrop(event, sameTimeOnDay(span, d)); },
      onEnd: () => setHover(null),
    });
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-vc-line max-sm:-mx-2 max-sm:rounded-none max-sm:border-x-0">
      <div className="grid shrink-0 grid-cols-7 border-b border-vc-line bg-vc-veil text-xs font-medium text-vc-text-secondary">
        {weekdays.map((w, i) => <div key={i} className="px-1 py-1.5 text-center capitalize">{w}</div>)}
      </div>
      <div ref={scroller} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {weeks.map((week) => (
          <div key={dayKey(week[0]!)} data-week={dayKey(week[0]!)} className="grid h-28 grid-cols-7 [@media(max-height:500px)]:h-24">
            {week.map((d) => {
              const key = dayKey(d);
              const list = byDay.get(key) ?? [];
              const odd = d.getMonth() % 2 === 1;
              return (
                <div key={key} data-day={key} role="button" tabIndex={0} aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(d)}
                  onClick={() => onDay(d)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDay(d); } }}
                  className={`flex min-w-0 cursor-pointer flex-col gap-0.5 overflow-hidden border-b border-r border-vc-line p-0.5 max-sm:border-r-0 ${hover === key ? "bg-vc-veil-strong" : odd ? "bg-vc-veil/50" : ""}`}>
                  <span className={`mb-0.5 flex h-6 items-center justify-center self-center text-xs ${key === todayKey ? "min-w-6 rounded-full bg-vc-main px-1 font-semibold text-white" : d.getDate() === 1 ? "font-semibold text-vc-main" : ""}`}>
                    {d.getDate() === 1 ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d) : d.getDate()}
                  </span>
                  {list.slice(0, MAX_PER_DAY).map(({ event, span }) => (
                    <EventChip key={`${event.id}-${key}`} event={event} span={span} calendar={event.calendarId ? calendars.get(event.calendarId) : undefined} locale={locale} untitled={t("cal.untitled")} showTime={false} onClick={onEvent} className="!px-1 !py-px text-[10px]" draggable={isMovable(event)} onPointerDown={(e) => touchDrag(e, event, span)} />
                  ))}
                  {list.length > MAX_PER_DAY && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); onMore(d); }} className="text-center text-[10px] text-vc-text-secondary">{t("cal.more", { n: list.length - MAX_PER_DAY })}</button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
