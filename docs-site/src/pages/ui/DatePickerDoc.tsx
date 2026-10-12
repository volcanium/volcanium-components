import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { DatePicker } from "@lib";

export default function DatePickerDoc() {
  const [date, setDate] = useState("2026-10-12");
  return (
    <DocPage name="DatePicker" description="A date field with a calendar panel and typed input. Value is an ISO `yyyy-MM-dd` string, like <input type=&quot;date&quot;>. Month and weekday names follow the VolcaniumProvider language (fr, en, es).">
      <Example title="Basic" code={`<DatePicker label="Due date" value={date} onChange={setDate} />`}>
        <DatePicker label="Due date" value={date} onChange={setDate} />
      </Example>
      <PropsTable rows={[
        { name: "value", type: "Date | string | null", description: "Selected date (Date or ISO yyyy-MM-dd)." },
        { name: "onChange", type: "(value: string) => void", description: "Called with an ISO yyyy-MM-dd string." },
        { name: "label / placeholder / id / className / disabled", type: "—", description: "Usual field settings." },
        { name: "minDate / maxDate", type: "Date", description: "Selectable range." },
        { name: "language", type: '"fr" | "en" | "es"', description: "Overrides the provider language." },
      ]} />
    </DocPage>
  );
}
