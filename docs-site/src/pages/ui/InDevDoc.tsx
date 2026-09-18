import { useState } from "react";
import { InDev, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function InDevDoc() {
  const [open, setOpen] = useState(false);
  return (
    <DocPage name="InDev" description="A trivial preconfigured Modal shown for features that aren't built yet — title and message come from the current language dictionary.">
      <Example code={`<Button onClick={() => setOpen(true)}>Open "not available" modal</Button>\n<InDev isOpen={open} onClose={() => setOpen(false)} />`}>
        <Button onClick={() => setOpen(true)}>Open "not available" modal</Button>
        <InDev isOpen={open} onClose={() => setOpen(false)} />
      </Example>
      <PropsTable
        rows={[
          { name: "...props", type: "Partial<ModalProps>", description: "Same props as Modal (isOpen, onClose, buttons, ...); title/children are fixed to translated strings." },
        ]}
      />
    </DocPage>
  );
}
