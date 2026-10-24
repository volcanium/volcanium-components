import { Grid, Container } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function GridDoc() {
  return (
    <DocPage name="Grid" description={"Grille adaptative, utile pour disposer des cartes."}>
      <Example code={`<Grid min={200}>\n  <Container title="One">Card A</Container>\n  <Container title="Two">Card B</Container>\n  <Container title="Three">Card C</Container>\n</Grid>`}>
        <div className="w-full">
          <Grid min={200}>
            <Container title="One">Card A</Container>
            <Container title="Two">Card B</Container>
            <Container title="Three">Card C</Container>
          </Grid>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Éléments de la grille." },
          { name: "min", type: "number", default: "300", description: "Largeur minimale d'une colonne, en pixels." },
        ]}
      />
    </DocPage>
  );
}
