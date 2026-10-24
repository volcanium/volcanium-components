import { TooltipButton, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TooltipButtonDoc() {
  return (
    <DocPage name="TooltipButton" description={"Entoure un élément (souvent un Button) et affiche une info-bulle au survol ou au focus."}>
      <Example code={`<TooltipButton tooltip="This is a helpful tooltip">\n  <Button variant="secondary">Hover me</Button>\n</TooltipButton>`}>
        <TooltipButton tooltip="This is a helpful tooltip">
          <Button variant="secondary">Hover me</Button>
        </TooltipButton>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Élément auquel l'info-bulle est liée." },
          { name: "tooltip", type: "ReactNode", description: "Contenu de l'info-bulle." },
        ]}
      />
    </DocPage>
  );
}
