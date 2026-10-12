import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { Tabs } from "@lib";

export default function TabsDoc() {
  const [tab, setTab] = useState("general");
  return (
    <DocPage name="Tabs" description="Underlined tab bar: the active tab is marked by a vc-main line, horizontal scroll on overflow, keyboard navigation (arrows). Tabs can carry their own `content`, or you drive the content yourself from `value`.">
      <Example title="With content" code={`const [tab, setTab] = useState("general");\n\n<Tabs\n  value={tab}\n  onChange={setTab}\n  tabs={[\n    { id: "general", label: "General", content: <p>General settings</p> },\n    { id: "members", label: "Members", badge: 3, content: <p>Members list</p> },\n    { id: "billing", label: "Billing", disabled: true },\n  ]}\n/>`}>
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
        { name: "value", type: "string", description: "Id of the active tab." },
        { name: "onChange", type: "(id: string) => void", description: "Called when another tab is picked." },
        { name: "className", type: "string", description: "Classes of the tab bar." },
        { name: "contentClassName", type: "string", description: "Classes of the content block." },
      ]} />
    </DocPage>
  );
}
