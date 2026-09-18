import { Title } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TitleDoc() {
  return (
    <DocPage name="Title" description="Simple styled heading (h2) used throughout the library as a section title.">
      <Example code={`<Title>Section title</Title>\n<Title className="text-4xl">Bigger title</Title>`}>
        <Title>Section title</Title>
        <Title className="text-4xl">Bigger title</Title>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Title text/content." },
          { name: "className", type: "string", description: "Extra classes merged via tailwind-merge." },
        ]}
      />
    </DocPage>
  );
}
