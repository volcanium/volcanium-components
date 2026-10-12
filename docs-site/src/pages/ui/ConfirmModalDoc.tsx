import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { Button, ConfirmModal, PromptModal } from "@lib";

export default function ConfirmModalDoc() {
  const [confirm, setConfirm] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [name, setName] = useState("My project");
  return (
    <DocPage name="ConfirmModal / PromptModal" description="Replacements for window.confirm / window.prompt. The action may be async: if it rejects, the error is displayed and the window stays open; otherwise it closes. Default labels follow the VolcaniumProvider language.">
      <Example title="ConfirmModal (destructive, type-to-confirm)" code={`<ConfirmModal\n  isOpen={open}\n  onClose={() => setOpen(false)}\n  title="Delete project"\n  danger\n  requireText="my-project"\n  onConfirm={async () => { await deleteProject(); }}\n>\n  This cannot be undone.\n</ConfirmModal>`}>
        <Button onClick={() => setConfirm(true)}>Delete…</Button>
        <ConfirmModal isOpen={confirm} onClose={() => setConfirm(false)} title="Delete project" danger requireText="my-project" onConfirm={async () => {}}>This cannot be undone.</ConfirmModal>
      </Example>
      <Example title="PromptModal" code={`<PromptModal isOpen={open} onClose={() => setOpen(false)} title="Rename" label="Name" initialValue={name} onSubmit={(v) => setName(v)} />`}>
        <Button onClick={() => setPrompt(true)}>Rename ({name})</Button>
        <PromptModal isOpen={prompt} onClose={() => setPrompt(false)} title="Rename" label="Name" initialValue={name} onSubmit={(v) => setName(v)} />
      </Example>
      <PropsTable rows={[
        { name: "isOpen / onClose / title", type: "boolean / () => void / string", description: "Visibility, close handler, title." },
        { name: "onConfirm (Confirm)", type: "() => void | Promise<unknown>", description: "Run on confirmation." },
        { name: "onSubmit (Prompt)", type: "(value: string) => void | Promise<unknown>", description: "Run with the typed value (Enter submits)." },
        { name: "danger", type: "boolean", description: "Destructive style for the confirm button." },
        { name: "requireText", type: "string", description: "The user must retype this text to enable the button." },
        { name: "secondary", type: "{ label, onClick }", description: "Additional button (ConfirmModal)." },
        { name: "confirmLabel / cancelLabel", type: "string", description: "Override the translated defaults." },
        { name: "label / initialValue / placeholder", type: "string", description: "Field settings (PromptModal)." },
      ]} />
    </DocPage>
  );
}
