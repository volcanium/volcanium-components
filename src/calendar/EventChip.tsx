import { IconCake } from "@tabler/icons-react";
import type { CalEvent, CalendarInfo } from "./types";
import { isBirthdayEvent } from "./birthdays";
import type { Span } from "./time";
import { useIsTouch } from "./viewport";
import { colorOf, readableOn } from "./colors";

export const timeFormat = (locale: string, d: Date) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(d);

/** Pastille d'un evenement : couleur du calendrier, annule = barre, invitation en attente = contour. Le titre est affiche en TEXTE. */
export default function EventChip({ event, span, calendar, locale, untitled, showTime = true, onClick, className = "", style, draggable = false, onDragStart, onDragEnd, onPointerDown }: {
  event: CalEvent; span: Span; calendar: CalendarInfo | undefined; locale: string; untitled: string; showTime?: boolean; onClick: (e: CalEvent) => void; className?: string; style?: React.CSSProperties;
  draggable?: boolean; onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void; onDragEnd?: () => void; onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const touch = useIsTouch();
  const bg = colorOf(calendar);
  const pending = event.myStatus === "needs-action" || event.myStatus === "tentative";
  const declined = event.myStatus === "declined";
  const label = `${showTime && !span.allDay ? `${timeFormat(locale, span.start)} ` : ""}${event.title || untitled}`;
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      draggable={draggable && !touch}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onPointerDown={draggable ? onPointerDown : undefined}
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      className={`block w-full overflow-hidden rounded px-1.5 py-0.5 text-start text-xs leading-tight ${draggable ? "cursor-grab active:cursor-grabbing select-none [-webkit-touch-callout:none] " : ""}${event.status === "cancelled" || declined ? "line-through opacity-60" : ""} ${className}`}
      style={{ backgroundColor: pending ? "transparent" : bg, color: pending ? bg : readableOn(bg), border: `1.5px solid ${bg}`, ...style }}
    >
      <span className="flex items-center gap-1">
        {isBirthdayEvent(event) && <IconCake size={12} aria-hidden className="shrink-0" />}
        <span className="block truncate">{label}</span>
      </span>
    </button>
  );
}
