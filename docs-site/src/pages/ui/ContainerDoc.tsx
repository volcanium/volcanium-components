import { Container } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ContainerDoc() {
  return (
    <DocPage name="Container" description="Carte avec un titre et un contenu, éventuellement cliquable.">
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
          { name: "title", type: "string", description: "Titre affiché en haut." },
          { name: "children", type: "ReactNode", description: "Contenu de la carte." },
          { name: "fix", type: "boolean", default: "false", description: "Largeur fixe au lieu de la pleine largeur." },
          { name: "link", type: "string", description: "Rend la carte cliquable et affiche une flèche au survol." },
        ]}
      />
    </DocPage>
  );
}
