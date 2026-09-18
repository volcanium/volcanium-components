import { Form, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function FormDoc() {
  return (
    <DocPage
      name="Form"
      description='Declarative form built from a list of field descriptors, with a submit button centered below. Each field renders as `Input` by default — set `type: "textarea"`, `type: "select"` or `type: "toggle"` to render those components instead.'
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
        title="Mixed field types (input, textarea, select, toggle)"
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
          { name: "fields", type: "FormField[]", description: '{ name, label?, type?, value?, default?, placeholder?, options?, searchable?, resize?, autoComplete?, className?, hidden?, props? }[]. `type` is "textarea" | "select" | "toggle" or any <input> type.' },
          { name: "btn", type: "ReactNode", description: "Submit control rendered centered below the fields (usually a <Button type=\"submit\">)." },
          { name: "onSubmit", type: "(values: Record<string, unknown>) => void", description: "Called with all field values keyed by name (string for input/textarea/select's value type, boolean for toggle)." },
          { name: "className", type: "string", description: "Extra classes on the <form> — the default is a max-w-md column, wider than a lone Input/Select." },
          { name: "id", type: "string", description: "Form id." },
        ]}
      />
    </DocPage>
  );
}
