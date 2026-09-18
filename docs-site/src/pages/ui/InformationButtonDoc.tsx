import { useState } from "react";
import { InformationButton, InfoItem } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function InformationButtonDoc() {
  const [payload, setPayload] = useState<any>(null);
  const info: InfoItem = { name: "Email", title: "Email address", value: "jane@doe.com", infos: ["Used for login"] };

  return (
    <DocPage name="InformationButton" description="A labeled button showing an info item's current value; clicking it hands off a normalized payload (title/value/infos/inputType) to a setter, typically used to open an edit Modal.">
      <Example code={`const info = { name: "Email", title: "Email address", value: "jane@doe.com", infos: ["Used for login"] };\n\n<InformationButton\n  info={info}\n  setCurrentModif={(payload) => console.log(payload)}\n  setShowModal={(show) => console.log(show)}\n/>`}>
        <div className="w-64">
          <InformationButton
            info={info}
            setCurrentModif={(p) => setPayload(p)}
            setShowModal={() => {}}
          />
        </div>
        {payload && <p className="text-white/50 text-sm">Last payload title: {payload.title}</p>}
      </Example>
      <PropsTable
        rows={[
          { name: "info", type: "InfoItem", description: "{ name, title, value, infos?, inputType? } to display." },
          { name: "setCurrentModif", type: "(payload: InformationButtonPayload) => void", description: "Receives the normalized payload on click." },
          { name: "setShowModal", type: "(show: boolean) => void", description: "Called with true on click, typically to open a Modal." },
          { name: "modifFn", type: "() => void", description: "Forwarded into the payload as modifFn." },
          { name: "onClick", type: "() => void", description: "Extra click handler, called before the above." },
        ]}
      />
    </DocPage>
  );
}
