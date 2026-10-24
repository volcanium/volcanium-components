import { useState } from "react";
import { Button } from "@lib";
import { IconPlus } from "@tabler/icons-react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ButtonDoc() {
  const [loading, setLoading] = useState(false);
  return (
    <DocPage
      name="Button"
      description="Bouton avec plusieurs styles, une icône facultative et un état de chargement. Peut aussi servir de lien."
    >
      <Example
        title="Styles"
        code={`<Button variant="accent">Accent</Button>\n<Button variant="primary">Primary</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="dangerous">Dangerous</Button>\n<Button variant="discret">Discret</Button>`}
      >
        <Button variant="accent">Accent</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="dangerous">Dangerous</Button>
        <Button variant="discret">Discret</Button>
      </Example>

      <Example
        title="Icône et chargement"
        code={`<Button icon={<IconPlus size={18} />}>Add item</Button>\n<Button loading={loading} onClick={() => setLoading(true)}>Save</Button>`}
      >
        <Button icon={<IconPlus size={18} />}>Add item</Button>
        <Button loading={loading} onClick={() => setLoading((v) => !v)}>
          {loading ? "Chargement…" : "Activer le chargement"}
        </Button>
      </Example>

      <Example
        title="En lien"
        code={`<Button link="/ui/button">Go to this page</Button>`}
      >
        <Button link="/ui/button">Go to this page</Button>
      </Example>

      <PropsTable
        rows={[
          {
            name: "children",
            type: "ReactNode",
            description: "Contenu du bouton.",
          },
          {
            name: "variant",
            type: '"primary" | "secondary" | "tertiary" | "lum"',
            default: '"primary"',
            description: "Style du bouton.",
          },
          {
            name: "link",
            type: "string",
            description: "Transforme le bouton en lien.",
          },
          {
            name: "linkClassName",
            type: "string",
            description: "Classes du lien.",
          },
          {
            name: "loading",
            type: "boolean",
            default: "false",
            description:
              "Affiche un indicateur de chargement et désactive le clic.",
          },
          {
            name: "icon",
            type: "ReactNode",
            description:
              "Icône affichée avant le contenu (masquée pendant le chargement).",
          },
          {
            name: "className",
            type: "string",
            description: "Classes supplémentaires du bouton.",
          },
          {
            name: "onClick",
            type: "(e) => void",
            description: "Action au clic (ignorée pendant le chargement).",
          },
          {
            name: "...props",
            type: "ButtonHTMLAttributes<HTMLButtonElement>",
            description: "Toute propriété native d'un bouton (disabled, type, form…).",
          },
        ]}
      />
    </DocPage>
  );
}
