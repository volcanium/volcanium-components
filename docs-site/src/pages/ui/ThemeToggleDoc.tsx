import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { ThemeToggle } from "@lib";

export default function ThemeToggleDoc() {
  return (
    <DocPage name="ThemeToggle" description="A small switch flipping the VolcaniumProvider theme between dark and light. The choice is remembered in localStorage under `volcanium-theme` (shared by every Volcanium app; disable with `themeStorageKey={false}` on the provider).">
      <Example title="Basic" code={`<ThemeToggle />`}>
        <ThemeToggle />
      </Example>
      <PropsTable rows={[{ name: "className", type: "string", description: "Extra classes." }]} />
    </DocPage>
  );
}
