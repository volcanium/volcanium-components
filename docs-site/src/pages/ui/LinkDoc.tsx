import { Link } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function LinkDoc() {
  return (
    <DocPage name="Link" description={"Lien stylé. Avec la propriété link, la navigation passe par le routeur."}>
      <Example code={`<Link link="/ui/link">Go to this page (via router)</Link>\n<Link href="https://volcanium-studio.com/" target="_blank">External href</Link>`}>
        <Link link="/ui/link">Go to this page (via router)</Link>
        <Link href="https://volcanium-studio.com/" target="_blank" rel="noreferrer">
          External href
        </Link>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Contenu du lien." },
          { name: "link", type: "string", description: "Navigue vers cette adresse au clic." },
          { name: "...props", type: "AnchorHTMLAttributes<HTMLAnchorElement>", description: "Toute propriété native d'un lien (href, target…)." },
        ]}
      />
    </DocPage>
  );
}
