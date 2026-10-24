import { useState } from "react";
import { InDev, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function InDevDoc() {
  const [open, setOpen] = useState(false);
  return (
    <DocPage name="InDev" description={"Fenêtre prête à l'emploi pour les fonctionnalités à venir. Le titre et le message suivent la langue active."}>
      <Example code={`<Button onClick={() => setOpen(true)}>Open "not available" modal</Button>\n<InDev isOpen={open} onClose={() => setOpen(false)} />`}>
        <Button onClick={() => setOpen(true)}>Open "not available" modal</Button>
        <InDev isOpen={open} onClose={() => setOpen(false)} />
      </Example>
      <PropsTable
        rows={[
          { name: "...props", type: "Partial<ModalProps>", description: "Mêmes propriétés que Modal (isOpen, onClose, buttons…) ; le titre et le contenu sont fixes." },
        ]}
      />
    </DocPage>
  );
}
