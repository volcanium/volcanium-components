import { Title } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TitleDoc() {
  return (
    <DocPage name="Title" description="Titre de section (h2).">
      <Example code={`<Title>Section title</Title>\n<Title className="text-4xl">Bigger title</Title>`}>
        <Title>Section title</Title>
        <Title className="text-4xl">Bigger title</Title>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Texte du titre." },
          { name: "className", type: "string", description: "Classes supplémentaires." },
        ]}
      />
    </DocPage>
  );
}
