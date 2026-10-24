import { Button, Modal } from "./ui";
import { useI18n } from "./host";
import type { CalEvent, CalendarInfo } from "./types";
import { eventSpan } from "./time";

/** Evenement d'un agenda EXTERNE (iCloud, Yahoo) : lecture seule. Les textes viennent d'un tiers : affiches en texte, jamais en HTML. */
export default function ExternalEventDialog({ event, calendar, onClose }: { event: CalEvent | null; calendar: CalendarInfo | undefined; onClose: () => void }) {
  const { t, locale } = useI18n();
  if (!event) return null;
  const span = eventSpan(event);
  const day = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const lastDay = new Date(span.end.getTime() - 1);
  const when = span.allDay
    ? (lastDay.toDateString() === span.start.toDateString() ? day.format(span.start) : `${day.format(span.start)} – ${day.format(lastDay)}`)
    : `${day.format(span.start)}, ${time.format(span.start)} – ${time.format(span.end)}`;
  return (
    <Modal isOpen onClose={onClose} title={event.title || t("cal.untitled")} autoClose={false} buttons={false}>
      <div className="flex flex-col gap-3 text-sm">
        <p className="font-medium">{when}</p>
        {event.location && <p><span className="text-vc-text-secondary">{t("cal.event.location")} : </span>{event.location}</p>}
        {event.description && <p className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words">{event.description}</p>}
        {calendar && <p className="text-xs text-vc-text-secondary">{t("cal.event.calendar")} : {calendar.name}{calendar.mailboxAddress ? ` · ${calendar.mailboxAddress}` : ""}</p>}
        <p className="text-xs text-vc-text-secondary">{t("cal.readOnly")}</p>
        <div className="flex justify-end"><Button type="button" variant="secondary" onClick={onClose}>{t("cal.close")}</Button></div>
      </div>
    </Modal>
  );
}
