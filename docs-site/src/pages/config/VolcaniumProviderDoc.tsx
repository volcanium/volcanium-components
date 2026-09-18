import { useVolcaniumConfig } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

function LangSwitcher() {
  const { language, setLanguage } = useVolcaniumConfig();
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/70">Current language: {language}</span>
      <button
        className="px-3 py-1 rounded-lg bg-main text-white"
        onClick={() => setLanguage(language === "en" ? "fr" : "en")}
      >
        Toggle fr/en
      </button>
    </div>
  );
}

export default function VolcaniumProviderDoc() {
  return (
    <DocPage
      name="VolcaniumProvider"
      description="Root context provider for the library. Several components (Nav, Sidebar, Modal, InDev, Table, Select, Stepper) read shared French/English text through it via the useLanguage hook, so wrap your app in it once at the top level."
    >
      <Example title="Live language toggle (this whole docs site is wrapped in one)" code={`import { VolcaniumProvider, useVolcaniumConfig } from "@volcanium/volcanium-components";

function LangSwitcher() {
  const { language, setLanguage } = useVolcaniumConfig();
  return (
    <button onClick={() => setLanguage(language === "en" ? "fr" : "en")}>
      Toggle language (currently {language})
    </button>
  );
}

export default function App() {
  return (
    <VolcaniumProvider config={{ lang: "en" }}>
      <LangSwitcher />
    </VolcaniumProvider>
  );
}`}>
        <LangSwitcher />
      </Example>

      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "App tree that gets access to the config context." },
          { name: "config", type: "Partial<VolcaniumConfig>", default: "{}", description: "Initial config. Currently supports { lang: \"fr\" | \"en\" | string }." },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-secondary">useVolcaniumConfig()</h3>
        <p className="text-white/70">Returns {"{ language, setLanguage }"} — read/write the current language from anywhere under the provider.</p>
      </div>
    </DocPage>
  );
}
