import { useState } from "react";
import { InformationButton } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function InformationButtonDoc() {
  const [name, setName] = useState("Jane Doe");
  const [lang, setLang] = useState<unknown>("fr");
  const [clicks, setClicks] = useState(0);

  const langs = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];

  return (
    <DocPage name="InformationButton" description="A labeled value row (small caption above a value) with three independent modes: inline text edit (editable), inline dropdown (options), or a plain click action (onClick).">
      <Example code={`<InformationButton\n  label="Name"\n  value={name}\n  editable\n  onSave={async (v) => setName(v)}\n/>`}>
        <div className="w-64">
          <InformationButton label="Name" value={name} editable onSave={async (v) => setName(v)} />
        </div>
      </Example>
      <Example code={`<InformationButton\n  label="Language"\n  value={lang}\n  options={[{ value: "fr", label: "Français" }, ...]}\n  onChange={async (v) => setLang(v)}\n/>`}>
        <div className="w-64">
          <InformationButton label="Language" value={lang as string} options={langs} onChange={async (v) => setLang(v)} />
        </div>
      </Example>
      <Example code={`<InformationButton label="Password" value="••••••••" onClick={() => openModal()} />`}>
        <div className="w-64">
          <InformationButton label="Password" value="••••••••" onClick={() => setClicks((c) => c + 1)} />
        </div>
        {clicks > 0 && <p className="text-vc-secondary/50 text-sm">Clicked {clicks} time(s)</p>}
      </Example>
      <PropsTable
        rows={[
          { name: "label", type: "ReactNode", description: "Small caption shown above the value." },
          { name: "value", type: "ReactNode", description: "The value to display. In options mode, the raw value of the currently selected option." },
          { name: "placeholder", type: "ReactNode", description: "Shown instead of value when it is empty, undefined or null." },
          { name: "onClick", type: "() => void", description: "Plain action mode (delete, copy, open a modal...). Ignored when editable or options is set." },
          { name: "disabled", type: "boolean", description: "Disables interaction without hiding the row." },
          { name: "editable", type: "boolean", description: "Turns the value into an inline text field on click. Enter or blur commits through onSave." },
          { name: "inputType", type: "string", description: 'Native input type of the inline field (default "text").' },
          { name: "editValue", type: "string", description: "Raw string edited in the inline field. Defaults to String(value)." },
          { name: "onSave", type: "(newValue: string) => void | Promise<void>", description: "Called on commit, only if the value changed. A promise shows a small sync icon while pending." },
          { name: "options", type: "OptionsMenuOption[]", description: "Turns the row into an inline dropdown on click. value must match one option's value." },
          { name: "onChange", type: "(value: unknown) => void | Promise<void>", description: "Called with the picked option's value. A promise shows a small sync icon while pending." },
        ]}
      />
    </DocPage>
  );
}
