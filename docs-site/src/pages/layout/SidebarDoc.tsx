import { useState } from "react";
import { Sidebar } from "@lib";
import { IconHome, IconSettings, IconLogout } from "@tabler/icons-react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function SidebarDoc() {
  const [open, setOpen] = useState(true);
  return (
    <DocPage name="Sidebar" description="Collapsible application sidebar with a header, optional user card, grouped nav tabs, bottom tabs, and children rendered as the main content area.">
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
          { name: "isOpen", type: "boolean", default: "true", description: "Expanded/collapsed state (controlled if onToggle is given)." },
          { name: "onToggle", type: "(open: boolean) => void", description: "Called when the collapse button is clicked." },
          { name: "title", type: "string", default: '"Name"', description: "App/section title." },
          { name: "subtitle", type: "string", default: '"App"', description: "Subtitle under the title." },
          { name: "tabs", type: "TabDef[]", description: "Main nav tabs: { name, icon?, iconFilled?, page?, alert?, notActive?, loading?, onClick? }." },
          { name: "specificTabs", type: "SpecificTabsDef[]", description: "Extra tab groups shown only for a matching user.role: { groupName, role, tabs }." },
          { name: "bottomTabs", type: "TabDef[]", description: "Tabs pinned to the bottom (e.g. Logout)." },
          { name: "activePath", type: "string", default: '"/"', description: "Current path, used to highlight the active tab." },
          { name: "user", type: "{ name; roleName?; role?; avatarUrl?; initials? }", description: "Shows a user card under the header." },
          { name: "onUserModif", type: "() => void", description: "Shows an edit icon on the user card, called on click." },
          { name: "showBranding", type: "boolean", default: "true", description: "Shows the \"Panel powered by volcanium studio\" footer link." },
          { name: "hideMobileTrigger", type: "boolean", default: "false", description: "Below 640px: hides the floating hamburger button (the app opens the drawer itself through isOpen / onToggle, e.g. from a tab bar) and removes the top space it reserved." },
          { name: "children", type: "ReactNode", description: "Main content area next to the sidebar." },
        ]}
      />
    </DocPage>
  );
}
