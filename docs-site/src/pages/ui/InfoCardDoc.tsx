import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { InfoCard, InfoGrid } from "@lib";

export default function InfoCardDoc() {
  const [port, setPort] = useState("8080");
  return (
    <DocPage name="InfoCard / InfoGrid" description="An information tile: a label and a value. When `editable`, a click turns the value into a field (Enter or ✓ to save, Esc or ✕ to cancel). Place tiles in an `InfoGrid` (responsive grid).">
      <Example title="Read-only and editable" code={`<InfoGrid>\n  <InfoCard label="Status" value="Running" />\n  <InfoCard\n    label="Port"\n    value={port}\n    editable\n    validate={(v) => (/^\\d+$/.test(v) ? null : "Numbers only")}\n    onSave={async (v) => setPort(v)}\n  />\n</InfoGrid>`}>
        <InfoGrid className="w-full">
          <InfoCard label="Status" value="Running" />
          <InfoCard label="Port" value={port} editable validate={(v) => (/^\d+$/.test(v) ? null : "Numbers only")} onSave={async (v) => setPort(v)} />
        </InfoGrid>
      </Example>
      <PropsTable rows={[
        { name: "label", type: "ReactNode", description: "Small title of the tile." },
        { name: "value", type: "ReactNode", description: "What is shown at rest." },
        { name: "editable", type: "boolean", description: "Makes the value editable on click." },
        { name: "editType", type: '"text" | "number" | "password" | "textarea" | "select"', default: '"text"', description: "Field shown while editing." },
        { name: "editValue", type: "string", description: "Initial value of the field (defaults to `value` for text/number)." },
        { name: "options", type: "SelectOption<string>[]", description: 'Choices when `editType` is "select".' },
        { name: "onSave", type: "(value: string) => void | Promise<void>", description: "Called with the new value; if it rejects, the error is shown and the field stays open." },
        { name: "validate", type: "(value: string) => string | null", description: "Returns an error message, or null when valid." },
        { name: "placeholder / hint / mono / actions / className", type: "—", description: "Placeholder, small text under the value, monospace font, actions next to the label, extra classes." },
      ]} />
    </DocPage>
  );
}
