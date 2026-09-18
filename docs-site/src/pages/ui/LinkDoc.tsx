import { Link } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function LinkDoc() {
  return (
    <DocPage name="Link" description="A styled anchor that navigates via react-router's navigate() when a link prop is given, in addition to any native href behavior.">
      <Example code={`<Link link="/ui/link">Go to this page (via router)</Link>\n<Link href="https://volcanium-studio.com/" target="_blank">External href</Link>`}>
        <Link link="/ui/link">Go to this page (via router)</Link>
        <Link href="https://volcanium-studio.com/" target="_blank" rel="noreferrer">
          External href
        </Link>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Link text/content." },
          { name: "link", type: "string", description: "When set, calls react-router's navigate(link) on click." },
          { name: "...props", type: "AnchorHTMLAttributes<HTMLAnchorElement>", description: "Any native anchor prop, e.g. href, target." },
        ]}
      />
    </DocPage>
  );
}
