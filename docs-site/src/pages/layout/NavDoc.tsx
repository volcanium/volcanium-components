import { Nav, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function NavDoc() {
  return (
    <DocPage name="Nav" description={"Barre de navigation adaptative : en-tête compact avec menu déroulant sur mobile, en-tête fixe à trois colonnes sur ordinateur."}>
      <Example code={`<Nav\n  brandName="VOLCANIUM STUDIO"\n  links={[{ label: "Home", id: "home" }, { label: "Docs", href: "/layout/nav" }]}\n  rightContent={<Button>Sign in</Button>}\n/>`}>
        <div className="w-full border border-white/10 rounded-lg overflow-hidden">
          <Nav
            brandName="VOLCANIUM STUDIO"
            links={[{ label: "Home", href: "#" }, { label: "Docs", href: "/layout/nav" }]}
            rightContent={<Button>Sign in</Button>}
            disableScrollTracking
          />
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "displayNav", type: "boolean", default: "true", description: "Affiche ou masque les liens centraux." },
          { name: "title", type: "string", description: "Affiché à la place des liens (ordinateur) quand displayNav vaut false." },
          { name: "brandName", type: "ReactNode", default: '"VOLCANIUM STUDIO"', description: "Nom ou logo de la marque." },
          { name: "brandLink", type: "string", default: '"/"', description: "Adresse ouverte au clic sur la marque." },
          { name: "links", type: "NavLink[]", default: "[]", description: "{ label, id?, href? }[]. id active le défilement vers une section ; href définit l'adresse du lien." },
          { name: "rightContent", type: "ReactNode", description: "Contenu à droite (boutons de connexion, par exemple)." },
          { name: "mobileBottomContent", type: "ReactNode", description: "Contenu en bas du menu mobile." },
          { name: "className", type: "string", description: "Classes de l'en-tête ordinateur." },
          { name: "classNameMobile", type: "string", description: "Classes de l'en-tête mobile." },
          { name: "disableScrollTracking", type: "boolean", default: "false", description: "Désactive le suivi automatique de la section active." },
          { name: "overlayMode", type: "boolean", default: "false", description: "Place la barre au-dessus du contenu au lieu de l'intégrer au flux." },
        ]}
      />
    </DocPage>
  );
}
