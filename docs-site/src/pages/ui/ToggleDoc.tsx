import { useState } from "react";
import { Toggle } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ToggleDoc() {
  const [checked, setChecked] = useState(false);
  return (
    <DocPage name="Toggle" description={'An accessible switch (role="switch") with an optional label and loading state.'}>

      <Example title='variant="one" (default) — bg-back track' code={`const [checked, setChecked] = useState(false);\n\n<Toggle checked={checked} onChange={setChecked} label="Enable notifications" />`}>
        <Toggle checked={checked} onChange={setChecked} label="Enable notifications" />
      </Example>
      <Example title='variant="secondary" — bg-container track' code={`<Toggle variant="secondary" checked={checked} onChange={setChecked} label="Enable notifications" />`}>
        <Toggle variant="secondary" checked={checked} onChange={setChecked} label="Enable notifications" />
      </Example>
      <PropsTable
        rows={[
          { name: "checked", type: "boolean", description: "Current state." },
          { name: "onChange", type: "(checked: boolean) => void", description: "Called with the new state." },
          { name: "disabled", type: "boolean", description: "Disables interaction." },
          { name: "label", type: "ReactNode", description: "Label shown to the left of the switch." },
          { name: "loading", type: "boolean", description: "Disables interaction and shows a spinning icon next to the label." },
          { name: "variant", type: '"one" | "secondary"', default: '"one"', description: "Unchecked track color: bg-back or bg-container." },
        ]}
      />
    </DocPage>
  );
}
