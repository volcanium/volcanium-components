import { useState } from "react";
import { Input } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function InputDoc() {
  const [value, setValue] = useState("");
  return (
    <DocPage
      name="Input"
      description={"Champ de saisie avec libellé facultatif et deux styles de fond."}
    >
      <Example
        title={"Simple, avec libellé, en chargement"}
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
            description: "Sert de texte indicatif.",
          },
          {
            name: "label",
            type: "ReactNode",
            description: "Libellé affiché sous le champ.",
          },
          {
            name: "variant",
            type: '"one" | "secondary"',
            default: '"one"',
            description: "Couleur de fond : bg-back ou bg-container.",
          },
          {
            name: "loading",
            type: "boolean",
            description: "Affiche une icône de chargement à côté du libellé.",
          },
          {
            name: "id",
            type: "string",
            description: "Identifiant (généré automatiquement par défaut).",
          },
          {
            name: "className",
            type: "string",
            description: "Classes supplémentaires du champ.",
          },
          {
            name: "...props",
            type: "InputHTMLAttributes<HTMLInputElement>",
            description:
              "Toute propriété native d'un input (value, onChange, type, disabled…).",
          },
        ]}
      />
    </DocPage>
  );
}
