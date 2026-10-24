import { useState } from "react";
import { Sidebar } from "@lib";
import { IconHome, IconSettings, IconLogout } from "@tabler/icons-react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function SidebarDoc() {
  const [open, setOpen] = useState(true);
  return (
    <DocPage name="Sidebar" description={"Menu latéral réductible avec en-tête, carte utilisateur facultative, onglets de navigation et onglets du bas. Le contenu principal est affiché à côté."}>
      <Example code={`<Sidebar\n  isOpen={open}\n  onToggle={setOpen}\n  title="My App"\n  subtitle="Admin"\n  activePath="/layout/sidebar"\n  tabs={[{ name: "Home", icon: IconHome, page: "/layout/sidebar" }, { name: "Settings", icon: IconSettings, page: "/layout/sidebar" }]}\n  bottomTabs={[{ name: "Logout", icon: IconLogout, onClick: () => {} }]}\n  user={{ name: "Jane Doe", roleName: "Administrator", initials: "JD" }}\n>\n  <div className="p-6">Main content area (children)</div>\n</Sidebar>`}>
        <div className="w-full h-96 border border-white/10 rounded-lg overflow-hidden">
          <Sidebar
            isOpen={open}
            onToggle={setOpen}
            title="My App"
            subtitle="Admin"
            activePath="/layout/sidebar"
            tabs={[
              { name: "Home", icon: IconHome, page: "/layout/sidebar" },
              { name: "Settings", icon: IconSettings, page: "/layout/sidebar" },
            ]}
            bottomTabs={[{ name: "Logout", icon: IconLogout, onClick: () => {} }]}
            user={{ name: "Jane Doe", roleName: "Administrator", initials: "JD" }}
          >
            <div className="p-6">Main content area (children)</div>
          </Sidebar>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "isOpen", type: "boolean", default: "true", description: "Menu déplié ou réduit (contrôlé si onToggle est fourni)." },
          { name: "onToggle", type: "(open: boolean) => void", description: "Appelée au clic sur le bouton de réduction." },
          { name: "title", type: "string", default: '"Nom"', description: "Titre de l'application ou de la section." },
          { name: "subtitle", type: "string", default: '"Application"', description: "Sous-titre." },
          { name: "tabs", type: "TabDef[]", description: "Onglets principaux : { name, icon?, iconFilled?, page?, alert?, notActive?, loading?, onClick? }." },
          { name: "specificTabs", type: "SpecificTabsDef[]", description: "Groupes d'onglets réservés à un rôle : { groupName, role, tabs }." },
          { name: "bottomTabs", type: "TabDef[]", description: "Onglets fixés en bas (Déconnexion, par exemple)." },
          { name: "activePath", type: "string", default: '"/"', description: "Chemin actuel, pour mettre en évidence l'onglet actif." },
          { name: "user", type: "{ name; roleName?; role?; avatarUrl?; initials? }", description: "Affiche une carte utilisateur sous l'en-tête." },
          { name: "onUserModif", type: "() => void", description: "Affiche une icône de modification sur la carte utilisateur ; appelée au clic." },
          { name: "showBranding", type: "boolean", default: "true", description: "Affiche le lien « Propulsé par volcanium studio » en bas du menu." },
          { name: "hideMobileTrigger", type: "boolean", default: "false", description: "Sous 640 px : masque le bouton de menu flottant (l'application ouvre le menu via isOpen et onToggle) et supprime l'espace réservé." },
          { name: "children", type: "ReactNode", description: "Contenu principal, à côté du menu." },
        ]}
      />
    </DocPage>
  );
}
