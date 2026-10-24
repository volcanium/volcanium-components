import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { InfoCard, InfoGrid } from "@lib";

export default function InfoCardDoc() {
  const [port, setPort] = useState("8080");
  return (
    <DocPage name="InfoCard / InfoGrid" description={"Tuile d'information (libellé et valeur). Avec editable, un clic transforme la valeur en champ (Entrée ou ✓ pour enregistrer, Échap ou ✕ pour annuler). Placez les tuiles dans un InfoGrid."}>
      <Example title={"Lecture seule et modifiable"} code={`<InfoGrid>\n  <InfoCard label="Status" value="Running" />\n  <InfoCard\n    label="Port"\n    value={port}\n    editable\n    validate={(v) => (/^\\d+$/.test(v) ? null : "Numbers only")}\n    onSave={async (v) => setPort(v)}\n  />\n</InfoGrid>`}>
        <InfoGrid className="w-full">
          <InfoCard label="Status" value="Running" />
          <InfoCard label="Port" value={port} editable validate={(v) => (/^\d+$/.test(v) ? null : "Numbers only")} onSave={async (v) => setPort(v)} />
        </InfoGrid>
      </Example>
      <PropsTable rows={[
        { name: "label", type: "ReactNode", description: "Libellé de la tuile." },
        { name: "value", type: "ReactNode", description: "Valeur affichée." },
        { name: "editable", type: "boolean", description: "Rend la valeur modifiable au clic." },
        { name: "editType", type: '"text" | "number" | "password" | "textarea" | "select"', default: '"text"', description: "Champ affiché pendant la modification." },
        { name: "editValue", type: "string", description: "Valeur initiale du champ (par défaut, value pour text et number)." },
        { name: "options", type: "SelectOption<string>[]", description: "Choix proposés quand editType vaut \"select\"." },
        { name: "onSave", type: "(value: string) => void | Promise<void>", description: "Appelée avec la nouvelle valeur. En cas d'échec, l'erreur s'affiche et le champ reste ouvert." },
        { name: "validate", type: "(value: string) => string | null", description: "Renvoie un message d'erreur, ou null si la valeur est valide." },
        { name: "placeholder / hint / mono / actions / className", type: "—", description: "Texte indicatif, aide sous la valeur, police à chasse fixe, actions à côté du libellé, classes supplémentaires." },
      ]} />
    </DocPage>
  );
}
