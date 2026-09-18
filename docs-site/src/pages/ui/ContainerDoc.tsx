import { Container } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ContainerDoc() {
  return (
    <DocPage name="Container" description="A card with a title and content section, optionally clickable/navigable via a link.">
      <Example code={`<Container title="Plain container">\n  <p>Some content inside the card.</p>\n</Container>\n\n<Container title="Clickable container" link="/ui/container">\n  <p>Click anywhere on this card to navigate.</p>\n</Container>`}>
        <Container title="Plain container">
          <p>Some content inside the card.</p>
        </Container>
        <Container title="Clickable container" link="/ui/container">
          <p>Click anywhere on this card to navigate.</p>
        </Container>
      </Example>
      <PropsTable
        rows={[
          { name: "title", type: "string", description: "Title text displayed at the top." },
          { name: "children", type: "ReactNode", description: "Content rendered inside the container." },
          { name: "fix", type: "boolean", default: "false", description: "Applies fixed width styling (w-200) instead of full width." },
          { name: "link", type: "string", description: "When set, wraps the card in a react-router Link and shows an arrow icon on hover." },
        ]}
      />
    </DocPage>
  );
}
