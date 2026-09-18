import { Grid, Container } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function GridDoc() {
  return (
    <DocPage name="Grid" description="Responsive auto-fit CSS grid, useful for laying out a list of Containers/cards.">
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
          { name: "children", type: "ReactNode", description: "Grid items." },
          { name: "min", type: "number", default: "300", description: "Minimum column width in pixels, used in the auto-fit minmax() track." },
        ]}
      />
    </DocPage>
  );
}
