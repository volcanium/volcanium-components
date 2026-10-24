import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { Button, ConfirmModal, PromptModal } from "@lib";

export default function ConfirmModalDoc() {
  const [confirm, setConfirm] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [name, setName] = useState("My project");
  return (
    <DocPage name="ConfirmModal / PromptModal" description="Fenêtres de confirmation et de saisie. Si l'action échoue, l'erreur s'affiche et la fenêtre reste ouverte. Les libellés par défaut suivent la langue de VolcaniumProvider.">
      <Example title="ConfirmModal (suppression avec saisie de confirmation)" code={`<ConfirmModal\n  isOpen={open}\n  onClose={() => setOpen(false)}\n  title="Delete project"\n  danger\n  requireText="my-project"\n  onConfirm={async () => { await deleteProject(); }}\n>\n  This cannot be undone.\n</ConfirmModal>`}>
        <Button onClick={() => setConfirm(true)}>Delete…</Button>
        <ConfirmModal isOpen={confirm} onClose={() => setConfirm(false)} title="Delete project" danger requireText="my-project" onConfirm={async () => {}}>This cannot be undone.</ConfirmModal>
      </Example>
      <Example title="PromptModal" code={`<PromptModal isOpen={open} onClose={() => setOpen(false)} title="Rename" label="Name" initialValue={name} onSubmit={(v) => setName(v)} />`}>
        <Button onClick={() => setPrompt(true)}>Rename ({name})</Button>
        <PromptModal isOpen={prompt} onClose={() => setPrompt(false)} title="Rename" label="Name" initialValue={name} onSubmit={(v) => setName(v)} />
      </Example>
      <PropsTable rows={[
        { name: "isOpen / onClose / title", type: "boolean / () => void / string", description: "Affichage, fermeture et titre." },
        { name: "onConfirm (Confirm)", type: "() => void | Promise<unknown>", description: "Exécutée à la confirmation." },
        { name: "onSubmit (Prompt)", type: "(value: string) => void | Promise<unknown>", description: "Exécutée avec la valeur saisie (Entrée pour valider)." },
        { name: "danger", type: "boolean", description: "Style d'action destructive pour le bouton de confirmation." },
        { name: "requireText", type: "string", description: "Texte à recopier pour activer le bouton." },
        { name: "secondary", type: "{ label, onClick }", description: "Bouton supplémentaire (ConfirmModal)." },
        { name: "confirmLabel / cancelLabel", type: "string", description: "Remplacent les libellés par défaut." },
        { name: "label / initialValue / placeholder", type: "string", description: "Réglages du champ (PromptModal)." },
      ]} />
    </DocPage>
  );
}
