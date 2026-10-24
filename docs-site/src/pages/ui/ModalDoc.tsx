import { useState } from "react";
import { Modal, Button, Input } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ModalDoc() {
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  return (
    <DocPage name="Modal" description={"Fenêtre animée avec focus automatique, Entrée pour confirmer, Échap pour fermer, et boutons configurables."}>
      <Example title={"Exemple de base"} code={`const [open, setOpen] = useState(false);\n\n<Button onClick={() => setOpen(true)}>Open modal</Button>\n<Modal isOpen={open} onClose={() => setOpen(false)} title="Hello" SubmitFn={() => alert("confirmed")}>\n  <p>This is the modal content.</p>\n</Modal>`}>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Hello" SubmitFn={() => alert("confirmed")}>
          <p>This is the modal content.</p>
        </Modal>
      </Example>

      <Example title={"Avec formulaire et boutons personnalisés"} code={`<Modal\n  isOpen={openForm}\n  onClose={() => setOpenForm(false)}\n  title="Edit name"\n  btn={{ confirm: { label: "Save" }, close: { label: "Cancel" } }}\n>\n  <Input label="Name">Enter a name</Input>\n</Modal>`}>
        <Button variant="secondary" onClick={() => setOpenForm(true)}>Open form modal</Button>
        <Modal
          isOpen={openForm}
          onClose={() => setOpenForm(false)}
          title="Edit name"
          btn={{ confirm: { label: "Save" }, close: { label: "Cancel" } }}
        >
          <Input label="Name">Enter a name</Input>
        </Modal>
      </Example>

      <PropsTable
        rows={[
          { name: "isOpen", type: "boolean", description: "Affiche ou masque la fenêtre." },
          { name: "onClose", type: "() => void", description: "Appelée à la fermeture (clic à l'extérieur, Échap, bouton Fermer)." },
          { name: "title", type: "string", description: "Titre de la fenêtre." },
          { name: "children", type: "ReactNode", description: "Contenu de la fenêtre." },
          { name: "buttons", type: "boolean", default: "true", description: "Affiche ou masque les boutons." },
          { name: "className", type: "string", description: "Classes supplémentaires du contenu." },
          { name: "btn", type: "{ close?: ModalButtonConfig; confirm?: ModalButtonConfig }", description: "Libellé, style, action et chargement de chaque bouton." },
          { name: "autoClose", type: "boolean", default: "true", description: "Ferme la fenêtre après la confirmation." },
          { name: "SubmitFn", type: "() => void", description: "Appelée au clic sur Confirmer (ou à l'appui sur Entrée)." },
          { name: "onRefuse", type: "() => void", description: "Appelée au clic sur Fermer (avant onClose)." },
        ]}
      />
    </DocPage>
  );
}
