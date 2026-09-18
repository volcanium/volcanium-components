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
      description="A custom dropdown select with an animated options list. Adding a `label` doesn't change its look — the trigger always renders the same way. Pass `searchable` to add a search box to the dropdown — the same component used to be split into `Select` / `SearchSelect`; it is now one component with search as an opt-in."
    >
      <Example
        title="Basic"
        code={`const options = [\n  { label: "Apple", value: "apple" },\n  { label: "Banana", value: "banana" },\n  { label: "Cherry", value: "cherry" },\n];\n\n<Select options={options} value={value} onChange={setValue} />`}
      >
        <Select options={options} value={value} onChange={setValue} />
      </Example>

      <Example
        title="With label"
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
        title="Searchable with server-side filtering"
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
          Query passed to <code>onSearchChange</code>: "{serverQuery}"
        </p>
      </Example>

      <PropsTable
        rows={[
          { name: "options", type: "SelectOption<T>[]", default: "[]", description: "{ label: ReactNode, value: T, searchText?: string }[]." },
          { name: "value", type: "T", description: "Currently selected value." },
          { name: "onChange", type: "(value: T) => void", description: "Called with the newly selected value." },
          { name: "placeholder", type: "string", description: "Shown when nothing is selected." },
          { name: "label", type: "ReactNode", description: "Optional label rendered below the trigger — doesn't change the trigger's style." },
          { name: "searchable", type: "boolean", default: "false", description: "Adds a search box to the dropdown panel." },
          { name: "onSearchChange", type: "(query: string) => void", description: "Drive filtering yourself (server-side) instead of the built-in client-side filter. Only used when `searchable`." },
          { name: "loading", type: "boolean", default: "false", description: "Shows a loading row instead of the option list. Only used when `searchable`." },
          { name: "searchPlaceholder", type: "string", description: "Placeholder for the search input. Only used when `searchable`." },
          { name: "noResultsText", type: "ReactNode", description: "Shown when the filtered list is empty. Only used when `searchable`." },
          { name: "id", type: "string", description: "Id for the trigger element (auto-generated otherwise)." },
          { name: "className", type: "string", description: "Extra classes on the trigger." },
        ]}
      />
    </DocPage>
  );
}
