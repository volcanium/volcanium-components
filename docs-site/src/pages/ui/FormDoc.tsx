import { Form, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function FormDoc() {
  return (
    <DocPage
      name="Form"
      description={"Formulaire généré à partir d'une liste de champs, avec un bouton d'envoi centré en dessous. Chaque champ est un Input par défaut ; utilisez type: \"textarea\", \"select\" ou \"toggle\" pour un autre composant."}
    >
      <Example code={`<Form\n  fields={[\n    { name: "name", label: "Full name", placeholder: "Jane Doe" },\n    { name: "email", label: "Email", type: "email", placeholder: "jane@doe.com" },\n  ]}\n  btn={<Button type="submit">Submit</Button>}\n  onSubmit={(values) => alert(JSON.stringify(values))}\n/>`}>
        <Form
          fields={[
            { name: "name", label: "Full name", placeholder: "Jane Doe" },
            { name: "email", label: "Email", type: "email", placeholder: "jane@doe.com" },
          ]}
          btn={<Button type="submit">Submit</Button>}
          onSubmit={(values) => alert(JSON.stringify(values))}
        />
      </Example>

      <Example
        title={"Types de champs variés (input, textarea, select, toggle)"}
        code={`<Form\n  fields={[\n    { name: "name", label: "Full name", placeholder: "Jane Doe" },\n    { name: "bio", label: "Bio", type: "textarea", placeholder: "A few words about you" },\n    {\n      name: "role",\n      label: "Role",\n      type: "select",\n      placeholder: "Choose a role",\n      options: [\n        { label: "Admin", value: "admin" },\n        { label: "Member", value: "member" },\n      ],\n    },\n    { name: "newsletter", label: "Subscribe to newsletter", type: "toggle" },\n  ]}\n  btn={<Button type="submit">Submit</Button>}\n  onSubmit={(values) => alert(JSON.stringify(values))}\n/>`}
      >
        <Form
          fields={[
            { name: "name2", label: "Full name", placeholder: "Jane Doe" },
            { name: "bio", label: "Bio", type: "textarea", placeholder: "A few words about you" },
            {
              name: "role",
              label: "Role",
              type: "select",
              placeholder: "Choose a role",
              options: [
                { label: "Admin", value: "admin" },
                { label: "Member", value: "member" },
              ],
            },
            { name: "newsletter", label: "Subscribe to newsletter", type: "toggle" },
          ]}
          btn={<Button type="submit">Submit</Button>}
          onSubmit={(values) => alert(JSON.stringify(values))}
        />
      </Example>

      <PropsTable
        rows={[
          { name: "fields", type: "FormField[]", description: "{ name, label?, type?, value?, default?, placeholder?, options?, searchable?, resize?, autoComplete?, className?, hidden?, props? }[]. type vaut \"textarea\", \"select\", \"toggle\" ou un type d'input." },
          { name: "btn", type: "ReactNode", description: "Bouton d'envoi centré sous les champs (en général un <Button type=\"submit\">)." },
          { name: "onSubmit", type: "(values: Record<string, unknown>) => void", description: "Appelée avec les valeurs de tous les champs, indexées par nom (booléen pour un toggle)." },
          { name: "className", type: "string", description: "Classes supplémentaires du formulaire (par défaut, une colonne de largeur limitée)." },
          { name: "id", type: "string", description: "Identifiant du formulaire." },
        ]}
      />
    </DocPage>
  );
}
