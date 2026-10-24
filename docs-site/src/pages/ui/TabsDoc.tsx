import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { Tabs } from "@lib";

export default function TabsDoc() {
  const [tab, setTab] = useState("general");
  return (
    <DocPage name="Tabs" description={"Barre d'onglets soulignée, avec défilement horizontal et navigation au clavier (flèches). Chaque onglet peut porter son content, ou vous gérez le contenu à partir de value."}>
      <Example title={"Avec contenu"} code={`const [tab, setTab] = useState("general");\n\n<Tabs\n  value={tab}\n  onChange={setTab}\n  tabs={[\n    { id: "general", label: "General", content: <p>General settings</p> },\n    { id: "members", label: "Members", badge: 3, content: <p>Members list</p> },\n    { id: "billing", label: "Billing", disabled: true },\n  ]}\n/>`}>
        <div className="w-full">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: "general", label: "General", content: <p className="py-4">General settings</p> },
            { id: "members", label: "Members", badge: 3, content: <p className="py-4">Members list</p> },
            { id: "billing", label: "Billing", disabled: true },
          ]} />
        </div>
      </Example>
      <PropsTable rows={[
        { name: "tabs", type: "TabItem[]", description: "{ id, label, icon?, badge?, disabled?, content? }." },
        { name: "value", type: "string", description: "Identifiant de l'onglet actif." },
        { name: "onChange", type: "(id: string) => void", description: "Appelée au changement d'onglet." },
        { name: "className", type: "string", description: "Classes de la barre d'onglets." },
        { name: "contentClassName", type: "string", description: "Classes du contenu." },
      ]} />
    </DocPage>
  );
}
