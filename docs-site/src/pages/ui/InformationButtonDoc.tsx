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
    <DocPage name="InformationButton" description={"Ligne libellé/valeur avec trois modes : modification du texte (editable), liste déroulante (options) ou simple action au clic (onClick)."}>
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
          { name: "label", type: "ReactNode", description: "Libellé affiché au-dessus de la valeur." },
          { name: "value", type: "ReactNode", description: "Valeur affichée. Avec options, valeur de l'option sélectionnée." },
          { name: "placeholder", type: "ReactNode", description: "Affiché quand la valeur est vide." },
          { name: "onClick", type: "() => void", description: "Action simple (supprimer, copier, ouvrir une fenêtre…). Ignorée avec editable ou options." },
          { name: "disabled", type: "boolean", description: "Désactive la ligne sans la masquer." },
          { name: "editable", type: "boolean", description: "Transforme la valeur en champ au clic. Entrée ou la perte du focus appelle onSave." },
          { name: "inputType", type: "string", description: "Type de champ (par défaut \"text\")." },
          { name: "editValue", type: "string", description: "Texte modifié dans le champ (par défaut, String(value))." },
          { name: "onSave", type: "(newValue: string) => void | Promise<void>", description: "Appelée à la validation, uniquement si la valeur a changé. Une icône de synchronisation s'affiche pendant l'attente." },
          { name: "options", type: "OptionsMenuOption[]", description: "Transforme la ligne en liste déroulante au clic. value doit correspondre à une option." },
          { name: "onChange", type: "(value: unknown) => void | Promise<void>", description: "Appelée avec la valeur choisie. Une icône de synchronisation s'affiche pendant l'attente." },
        ]}
      />
    </DocPage>
  );
}
