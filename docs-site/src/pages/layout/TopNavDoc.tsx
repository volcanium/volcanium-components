import { TopNav } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TopNavDoc() {
  return (
    <DocPage name="TopNav" description={"Barre de navigation fine avec un titre cliquable et des boutons de lien ; affiche un <Outlet /> en dessous pour les routes imbriquées."}>
      <Example code={`<TopNav\n  title="My App"\n  titleLink="/"\n  buttons={[{ label: "Dashboard", page: "/layout/top-nav" }, { label: "Settings", page: "/layout/top-nav" }]}\n/>`}>
        <div className="w-full border border-white/10 rounded-lg overflow-hidden">
          <TopNav
            title="My App"
            titleLink="/"
            buttons={[
              { label: "Dashboard", page: "/layout/top-nav" },
              { label: "Settings", page: "/layout/top-nav" },
            ]}
          />
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "title", type: "string", default: '"Application"', description: "Nom ou titre." },
          { name: "titleLink", type: "string", default: '"/"', description: "Page ouverte au clic sur le titre." },
          { name: "buttons", type: "TopNavBtn[]", default: "[]", description: "{ label, page, icon? }[] affichés sous forme de boutons-liens." },
          { name: "className", type: "string", description: "Classes supplémentaires du conteneur." },
          { name: "children", type: "ReactNode", description: "Contenu affiché à droite de la barre." },
        ]}
      />
      <p className="text-white/60 text-sm">Affiche le &lt;Outlet /&gt; de react-router sous la barre : à utiliser comme élément de route de mise en page.</p>
    </DocPage>
  );
}
