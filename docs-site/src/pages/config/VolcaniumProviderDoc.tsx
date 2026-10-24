import { useVolcaniumConfig } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

function LangSwitcher() {
  const { language, setLanguage } = useVolcaniumConfig();
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/70">Langue actuelle : {language}</span>
      <button
        className="px-3 py-1 rounded-lg bg-main text-white"
        onClick={() => setLanguage(language === "en" ? "fr" : "en")}
      >
        Basculer fr/en
      </button>
    </div>
  );
}

export default function VolcaniumProviderDoc() {
  return (
    <DocPage
      name="VolcaniumProvider"
      description={"Fournisseur de contexte de la bibliothèque. Plusieurs composants (Nav, Sidebar, Modal, InDev, Table, Select, Stepper) y lisent leurs textes en français ou en anglais. Placez-le une seule fois à la racine de l'application."}
    >
      <Example title={"Changement de langue en direct"} code={`import { VolcaniumProvider, useVolcaniumConfig } from "@volcanium/volcanium-components";

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
          { name: "children", type: "ReactNode", description: "Application qui accède à la configuration." },
          { name: "config", type: "Partial<VolcaniumConfig>", default: "{}", description: "Configuration initiale. Accepte { lang: \"fr\" | \"en\" | string }." },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-secondary">useVolcaniumConfig()</h3>
        <p className="text-white/70">Renvoie {"{ language, setLanguage }"} : lit et modifie la langue depuis n'importe quel composant du fournisseur.</p>
      </div>
    </DocPage>
  );
}
