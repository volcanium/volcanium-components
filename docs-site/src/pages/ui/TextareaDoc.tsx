import { Textarea } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TextareaDoc() {
  return (
    <DocPage name="Textarea" description="Styled multi-line text input with an optional label, two background variants, and configurable resize behavior.">
      <Example code={`<Textarea placeholder="Write something..." />\n<Textarea variant="secondary" label="Bio" resize="none" />`}>
        <Textarea placeholder="Write something..." />
        <Textarea variant="secondary" label="Bio" resize="none" />
      </Example>
      <PropsTable
        rows={[
          { name: "label", type: "ReactNode", description: "Label rendered below the textarea." },
          { name: "variant", type: '"one" | "secondary"', default: '"one"', description: "Background color." },
          { name: "resize", type: '"none" | "vertical" | "horizontal" | "both"', default: '"vertical"', description: "CSS resize behavior." },
          { name: "id", type: "string", description: "Id (auto-generated otherwise)." },
          { name: "className", type: "string", description: "Extra classes." },
          { name: "...props", type: "TextareaHTMLAttributes<HTMLTextAreaElement>", description: "Any native textarea prop." },
        ]}
      />
    </DocPage>
  );
}
