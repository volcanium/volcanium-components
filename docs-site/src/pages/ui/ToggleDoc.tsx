import { useState } from "react";
import { Toggle } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ToggleDoc() {
  const [checked, setChecked] = useState(false);
  return (
    <DocPage name="Toggle" description={"Interrupteur accessible (role=\"switch\") avec libellé et état de chargement facultatifs."}>

      <Example title='variant="one" (default) — bg-back track' code={`const [checked, setChecked] = useState(false);\n\n<Toggle checked={checked} onChange={setChecked} label="Enable notifications" />`}>
        <Toggle checked={checked} onChange={setChecked} label="Enable notifications" />
      </Example>
      <Example title='variant="secondary" — bg-container track' code={`<Toggle variant="secondary" checked={checked} onChange={setChecked} label="Enable notifications" />`}>
        <Toggle variant="secondary" checked={checked} onChange={setChecked} label="Enable notifications" />
      </Example>
      <PropsTable
        rows={[
          { name: "checked", type: "boolean", description: "État actuel." },
          { name: "onChange", type: "(checked: boolean) => void", description: "Appelée avec le nouvel état." },
          { name: "disabled", type: "boolean", description: "Désactive l'interrupteur." },
          { name: "label", type: "ReactNode", description: "Libellé affiché à gauche de l'interrupteur." },
          { name: "loading", type: "boolean", description: "Désactive l'interrupteur et affiche une icône de chargement." },
          { name: "variant", type: '"one" | "secondary"', default: '"one"', description: "Couleur de la piste désactivée : bg-back ou bg-container." },
        ]}
      />
    </DocPage>
  );
}
