import { useState } from "react";
import { Button } from "@lib";
import { IconPlus } from "@tabler/icons-react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ButtonDoc() {
  const [loading, setLoading] = useState(false);
  return (
    <DocPage
      name="Button"
      description="Standard button with 4 visual variants, an optional icon, and a loading state that replaces the icon with a spinner. Can also render as a link (react-router Link when inside a Router, else a plain <a>)."
    >
      <Example
        title="Variants"
        code={`<Button variant="accent">Accent</Button>\n<Button variant="primary">Primary</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="dangerous">Dangerous</Button>\n<Button variant="discret">Discret</Button>`}
      >
        <Button variant="accent">Accent</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="dangerous">Dangerous</Button>
        <Button variant="discret">Discret</Button>
      </Example>

      <Example
        title="Icon + loading"
        code={`<Button icon={<IconPlus size={18} />}>Add item</Button>\n<Button loading={loading} onClick={() => setLoading(true)}>Save</Button>`}
      >
        <Button icon={<IconPlus size={18} />}>Add item</Button>
        <Button loading={loading} onClick={() => setLoading((v) => !v)}>
          {loading ? "Loading..." : "Toggle loading"}
        </Button>
      </Example>

      <Example
        title="As a link"
        code={`<Button link="/ui/button">Go to this page</Button>`}
      >
        <Button link="/ui/button">Go to this page</Button>
      </Example>

      <PropsTable
        rows={[
          {
            name: "children",
            type: "ReactNode",
            description: "Button label/content.",
          },
          {
            name: "variant",
            type: '"primary" | "secondary" | "tertiary" | "lum"',
            default: '"primary"',
            description: "Visual style.",
          },
          {
            name: "link",
            type: "string",
            description: "When set, renders as a Link/<a> wrapping the button.",
          },
          {
            name: "linkClassName",
            type: "string",
            description: "Class applied to the wrapping link element.",
          },
          {
            name: "loading",
            type: "boolean",
            default: "false",
            description:
              "Shows a spinner instead of the icon and disables clicks.",
          },
          {
            name: "icon",
            type: "ReactNode",
            description:
              "Icon rendered before children (hidden while loading).",
          },
          {
            name: "className",
            type: "string",
            description: "Extra classes on the <button>.",
          },
          {
            name: "onClick",
            type: "(e) => void",
            description: "Click handler, skipped while loading.",
          },
          {
            name: "...props",
            type: "ButtonHTMLAttributes<HTMLButtonElement>",
            description: "Any native button prop, e.g. disabled, type, form.",
          },
        ]}
      />
    </DocPage>
  );
}
