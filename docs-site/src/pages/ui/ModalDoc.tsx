import { useState } from "react";
import { Modal, Button, Input } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ModalDoc() {
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  return (
    <DocPage name="Modal" description="Reusable animated dialog with autofocus, Enter-to-confirm / Escape-to-close shortcuts, and configurable close/confirm buttons.">
      <Example title="Basic" code={`const [open, setOpen] = useState(false);\n\n<Button onClick={() => setOpen(true)}>Open modal</Button>\n<Modal isOpen={open} onClose={() => setOpen(false)} title="Hello" SubmitFn={() => alert("confirmed")}>\n  <p>This is the modal content.</p>\n</Modal>`}>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Hello" SubmitFn={() => alert("confirmed")}>
          <p>This is the modal content.</p>
        </Modal>
      </Example>

      <Example title="With a form and custom buttons" code={`<Modal\n  isOpen={openForm}\n  onClose={() => setOpenForm(false)}\n  title="Edit name"\n  btn={{ confirm: { label: "Save" }, close: { label: "Cancel" } }}\n>\n  <Input label="Name">Enter a name</Input>\n</Modal>`}>
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
          { name: "isOpen", type: "boolean", description: "Controls visibility." },
          { name: "onClose", type: "() => void", description: "Called to close (backdrop click, Escape, close button)." },
          { name: "title", type: "string", description: "Header title." },
          { name: "children", type: "ReactNode", description: "Modal body content." },
          { name: "buttons", type: "boolean", default: "true", description: "Show/hide the close/confirm button row." },
          { name: "className", type: "string", description: "Extra classes on the content wrapper." },
          { name: "btn", type: "{ close?: ModalButtonConfig; confirm?: ModalButtonConfig }", description: "Per-button label/variant/onClick/loading overrides." },
          { name: "autoClose", type: "boolean", default: "true", description: "Close automatically after confirm." },
          { name: "SubmitFn", type: "() => void", description: "Called when the confirm button is clicked (or Enter is pressed)." },
          { name: "onRefuse", type: "() => void", description: "Called when the close button is clicked (before onClose)." },
        ]}
      />
    </DocPage>
  );
}
