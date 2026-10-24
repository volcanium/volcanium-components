import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { DatePicker } from "@lib";

export default function DatePickerDoc() {
  const [date, setDate] = useState("2026-10-12");
  return (
    <DocPage name="DatePicker" description="Champ de date avec calendrier et saisie au clavier. La valeur est au format yyyy-MM-dd. Les noms des mois et des jours suivent la langue de VolcaniumProvider (fr, en, es).">
      <Example title="Exemple de base" code={`<DatePicker label="Due date" value={date} onChange={setDate} />`}>
        <DatePicker label="Due date" value={date} onChange={setDate} />
      </Example>
      <PropsTable rows={[
        { name: "value", type: "Date | string | null", description: "Date sélectionnée (Date ou yyyy-MM-dd)." },
        { name: "onChange", type: "(value: string) => void", description: "Appelée avec la date au format yyyy-MM-dd." },
        { name: "label / placeholder / id / className / disabled", type: "—", description: "Réglages habituels d'un champ." },
        { name: "minDate / maxDate", type: "Date", description: "Dates sélectionnables." },
        { name: "language", type: '"fr" | "en" | "es"', description: "Remplace la langue du fournisseur." },
      ]} />
    </DocPage>
  );
}
