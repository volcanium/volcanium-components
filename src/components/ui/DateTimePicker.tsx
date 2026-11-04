import { useId, ReactNode } from "react";
import DatePicker, { type DatePickerLanguage } from "./DatePicker";
import TimePicker from "./TimePicker";

export interface DateTimePickerProps {
  /** Date et heure locales au format `yyyy-MM-ddTHH:mm` (comme `<input type="datetime-local">`). `""` ou absent = vide. */
  value?: string | null;
  /** Appelée avec `yyyy-MM-ddTHH:mm` quand date ET heure sont valides, `""` quand la date est vidée. Date seule saisie : l'heure `defaultTime` est appliquée. */
  onChange?: (value: string) => void;
  label?: ReactNode;
  id?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  language?: DatePickerLanguage;
  /** Pas (minutes) de la liste de créneaux. @default 15 */
  step?: number;
  /** Heure appliquée quand on choisit une date sans heure. @default "09:00" */
  defaultTime?: string;
}

/**
 * Date + heure saisissables au clavier (ou via le calendrier Volcanium et la liste d'heures), en remplacement de
 * `<input type="datetime-local">`. Même contrat de valeur que l'élément natif.
 */
export default function DateTimePicker({ value, onChange, label, id, className = "", disabled, minDate, maxDate, language, step, defaultTime = "09:00" }: DateTimePickerProps) {
  const generatedId = useId();
  const baseId = id || generatedId;
  const [date = "", time = ""] = (value ?? "").split("T");
  const hhmm = time.slice(0, 5);

  const field = (
    <div className={`flex w-full items-start gap-2 max-sm:flex-col max-sm:items-stretch ${className}`}>
      <div className="min-w-0 flex-1">
        <DatePicker
          id={baseId}
          value={date || null}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          language={language}
          onChange={(d) => onChange?.(d ? `${d}T${hhmm || defaultTime}` : "")}
        />
      </div>
      <div className="w-36 shrink-0 max-sm:w-full">
        <TimePicker
          id={`${baseId}-time`}
          value={hhmm}
          disabled={disabled || !date}
          step={step}
          onChange={(tm) => date && onChange?.(`${date}T${tm || defaultTime}`)}
        />
      </div>
    </div>
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {field}
      <label className="-mt-1 mb-1 text-start text-sm text-vc-text/50" htmlFor={baseId}>
        {label}
      </label>
    </div>
  ) : (
    field
  );
}
