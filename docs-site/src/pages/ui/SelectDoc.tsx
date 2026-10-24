import { useMemo, useState } from "react";
import { Select } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

const countries = [
  "Belgium", "France", "Germany", "Italy", "Japan", "Mexico", "Netherlands",
  "Norway", "Poland", "Portugal", "Spain", "Sweden", "Switzerland", "Vietnam",
].map((c) => ({ label: c, value: c }));

export default function SelectDoc() {
  const [value, setValue] = useState<string | undefined>();
  const [value2, setValue2] = useState<string | undefined>("banana");
  const [country, setCountry] = useState<string | undefined>();

  const [serverQuery, setServerQuery] = useState("");
  const [serverLoading, setServerLoading] = useState(false);
  const [serverResults, setServerResults] = useState(countries);
  const [serverValue, setServerValue] = useState<string | undefined>();

  const handleServerSearch = (query: string) => {
    setServerQuery(query);
    setServerLoading(true);
    // Simulates an API call — replace with a real fetch in a real app.
    setTimeout(() => {
      setServerResults(
        query.trim()
          ? countries.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
          : countries,
      );
      setServerLoading(false);
    }, 300);
  };

  const clientFilteredCount = useMemo(() => countries.length, []);

  return (
    <DocPage
      name="Select"
      description={"Liste déroulante animée. Le libellé ne change pas l'apparence du bouton. Ajoutez searchable pour afficher un champ de recherche."}
    >
      <Example
        title={"Exemple de base"}
        code={`const options = [\n  { label: "Apple", value: "apple" },\n  { label: "Banana", value: "banana" },\n  { label: "Cherry", value: "cherry" },\n];\n\n<Select options={options} value={value} onChange={setValue} />`}
      >
        <Select options={options} value={value} onChange={setValue} />
      </Example>

      <Example
        title={"Avec libellé"}
        code={`<Select label="Fruit" options={options} value={value2} onChange={setValue2} />`}
      >
        <Select label="Fruit" options={options} value={value2} onChange={setValue2} />
      </Example>

      <Example
        title={`Searchable (${clientFilteredCount} options, filtered client-side)`}
        code={`<Select\n  searchable\n  label="Country"\n  options={countries}\n  value={country}\n  onChange={setCountry}\n/>`}
      >
        <Select
          searchable
          label="Country"
          options={countries}
          value={country}
          onChange={setCountry}
        />
      </Example>

      <Example
        title={"Recherche filtrée par le serveur"}
        code={`const [results, setResults] = useState(countries);\nconst [loading, setLoading] = useState(false);\n\nconst handleSearch = (query) => {\n  setLoading(true);\n  fetchCountries(query).then((data) => {\n    setResults(data);\n    setLoading(false);\n  });\n};\n\n<Select\n  searchable\n  options={results}\n  loading={loading}\n  onSearchChange={handleSearch}\n  value={value}\n  onChange={setValue}\n  noResultsText="No matching country"\n/>`}
      >
        <Select
          searchable
          options={serverResults}
          loading={serverLoading}
          onSearchChange={handleServerSearch}
          value={serverValue}
          onChange={setServerValue}
          noResultsText="No matching country"
        />
        <p className="text-xs text-white/40 mt-2">
          Recherche transmise à <code>onSearchChange</code> : "{serverQuery}"
        </p>
      </Example>

      <PropsTable
        rows={[
          { name: "options", type: "SelectOption<T>[]", default: "[]", description: "{ label: ReactNode, value: T, searchText?: string }[]." },
          { name: "value", type: "T", description: "Valeur sélectionnée." },
          { name: "onChange", type: "(value: T) => void", description: "Appelée avec la nouvelle valeur." },
          { name: "placeholder", type: "string", description: "Affiché quand rien n'est sélectionné." },
          { name: "label", type: "ReactNode", description: "Libellé facultatif sous le bouton, sans effet sur son style." },
          { name: "searchable", type: "boolean", default: "false", description: "Ajoute un champ de recherche à la liste." },
          { name: "onSearchChange", type: "(query: string) => void", description: "Gère le filtrage vous-même (côté serveur) au lieu du filtre intégré. Utilisée avec searchable." },
          { name: "loading", type: "boolean", default: "false", description: "Affiche un chargement à la place des options. Utilisée avec searchable." },
          { name: "searchPlaceholder", type: "string", description: "Texte indicatif du champ de recherche. Utilisée avec searchable." },
          { name: "noResultsText", type: "ReactNode", description: "Affiché quand aucune option ne correspond. Utilisée avec searchable." },
          { name: "id", type: "string", description: "Identifiant du bouton (généré automatiquement par défaut)." },
          { name: "className", type: "string", description: "Classes supplémentaires du bouton." },
        ]}
      />
    </DocPage>
  );
}
