import { useState } from "react";
import { Input } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function InputDoc() {
  const [value, setValue] = useState("");
  return (
    <DocPage
      name="Input"
      description="Styled text input with an optional label and two background variants."
    >
      <Example
        title="Plain / with label / loading"
        code={`<Input placeholder="Type here" />\n<Input label="Email" value={value} onChange={(e) => setValue(e.target.value)}>you@example.com</Input>\n<Input variant="secondary" label="Loading example" loading />`}
      >
        <Input>Type here</Input>
        <Input
          label="Email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          you@example.com
        </Input>
        <Input variant="secondary" label="Loading example" loading />
      </Example>
      <PropsTable
        rows={[
          {
            name: "children",
            type: "string",
            description: "Used as the placeholder text.",
          },
          {
            name: "label",
            type: "ReactNode",
            description: "Label rendered below the input.",
          },
          {
            name: "variant",
            type: '"one" | "secondary"',
            default: '"one"',
            description: "Background color: bg-back or bg-container.",
          },
          {
            name: "loading",
            type: "boolean",
            description: "Shows a spinning refresh icon next to the label.",
          },
          {
            name: "id",
            type: "string",
            description: "Input id (auto-generated otherwise).",
          },
          {
            name: "className",
            type: "string",
            description: "Extra classes on the <input>.",
          },
          {
            name: "...props",
            type: "InputHTMLAttributes<HTMLInputElement>",
            description:
              "Any native input prop (value, onChange, type, disabled, ...).",
          },
        ]}
      />
    </DocPage>
  );
}
