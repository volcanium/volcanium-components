import { CodeBlock } from "../components/DocPage";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-title text-main">@volcanium/volcanium-components</h1>
        <p className="text-white/70 text-lg">Bibliothèque de composants Volcanium</p>
      </div>

      <p className="text-white/70">
        Parcourez le menu pour consulter chaque composant, ses propriétés et des exemples en
        direct.
      </p>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-title text-secondary">Installation</h2>
        <CodeBlock code={`npm install @volcanium/volcanium-components`} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-title text-secondary">Utilisation</h2>
        <CodeBlock
          code={`import { VolcaniumProvider, Button } from "@volcanium/volcanium-components";
import "@volcanium/volcanium-components/index.css";

export default function App() {
  return (
    <VolcaniumProvider config={{ lang: "en" }}>
      <Button>Click me</Button>
    </VolcaniumProvider>
  );
}`}
        />
      </div>

      <p className="text-white/50 text-sm">
        Version 1.2.1. Les composants sont regroupés par usage : actions, formulaires et saisie,
        retours et fenêtres, affichage des données, contenu et mise en page.
      </p>
    </div>
  );
}
