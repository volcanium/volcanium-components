import { TopNav } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TopNavDoc() {
  return (
    <DocPage name="TopNav" description="A slim top navigation bar with a clickable title/logo and a row of link buttons, rendering an <Outlet /> below it for nested routes.">
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
          { name: "title", type: "string", default: '"App"', description: "Brand/title text." },
          { name: "titleLink", type: "string", default: '"/"', description: "Route the title links to." },
          { name: "buttons", type: "TopNavBtn[]", default: "[]", description: "{ label, page, icon? }[] rendered as Button links." },
          { name: "className", type: "string", description: "Extra classes on the wrapper." },
          { name: "children", type: "ReactNode", description: "Extra content rendered on the right side of the bar." },
        ]}
      />
      <p className="text-white/60 text-sm">Renders react-router's &lt;Outlet /&gt; below the bar — intended to be used as a layout route element.</p>
    </DocPage>
  );
}
