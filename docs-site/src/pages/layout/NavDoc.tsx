import { Nav, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function NavDoc() {
  return (
    <DocPage name="Nav" description="Responsive top navigation bar: a compact header + slide-down menu on mobile, a 3-column sticky header with scroll-spy section links on desktop.">
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
          { name: "displayNav", type: "boolean", default: "true", description: "Show/hide the central nav links." },
          { name: "title", type: "string", description: "Shown instead of links (desktop) when displayNav is false." },
          { name: "brandName", type: "ReactNode", default: '"VOLCANIUM STUDIO"', description: "Brand/logo text." },
          { name: "brandLink", type: "string", default: '"/"', description: "URL navigated to when clicking the brand (full page navigation)." },
          { name: "links", type: "NavLink[]", default: "[]", description: "{ label, id?, href? }[] — id enables smooth scroll-to-section, href is used as the anchor's href." },
          { name: "rightContent", type: "ReactNode", description: "Right-aligned content (e.g. auth buttons)." },
          { name: "mobileBottomContent", type: "ReactNode", description: "Extra content at the bottom of the mobile menu." },
          { name: "className", type: "string", description: "Classes for the desktop header." },
          { name: "classNameMobile", type: "string", description: "Classes for the mobile header." },
          { name: "disableScrollTracking", type: "boolean", default: "false", description: "Disables automatic active-section tracking on scroll." },
          { name: "overlayMode", type: "boolean", default: "false", description: "Positions the nav absolutely/fixed over page content instead of in normal flow." },
        ]}
      />
    </DocPage>
  );
}
