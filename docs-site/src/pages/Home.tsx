import { CodeBlock } from "../components/DocPage";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-title text-main">@volcanium/volcanium-components</h1>
        <p className="text-white/70 text-lg">UI Components Library for Volcanium</p>
      </div>

      <p className="text-white/70">
        This is a standalone documentation site for the component library, independent from
        Storybook. Browse the sidebar to see every exported component, its props, and live,
        rendered usage examples.
      </p>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-title text-secondary">Install</h2>
        <CodeBlock code={`npm install @volcanium/volcanium-components`} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-title text-secondary">Usage</h2>
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
        Version 1.2.1. Components are grouped in the sidebar by purpose — Actions, Forms &
        Inputs, Feedback & Overlays, Data Display, Content and Layout — to make things easier
        to browse.
      </p>
    </div>
  );
}
