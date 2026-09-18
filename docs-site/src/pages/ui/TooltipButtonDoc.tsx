import { TooltipButton, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TooltipButtonDoc() {
  return (
    <DocPage name="TooltipButton" description="Wraps any element (usually a Button) and shows a tooltip above it on hover/focus.">
      <Example code={`<TooltipButton tooltip="This is a helpful tooltip">\n  <Button variant="secondary">Hover me</Button>\n</TooltipButton>`}>
        <TooltipButton tooltip="This is a helpful tooltip">
          <Button variant="secondary">Hover me</Button>
        </TooltipButton>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "The trigger element the tooltip is attached to." },
          { name: "tooltip", type: "ReactNode", description: "Tooltip content." },
        ]}
      />
    </DocPage>
  );
}
