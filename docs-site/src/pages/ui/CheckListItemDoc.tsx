import { CheckListItem } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function CheckListItemDoc() {
  return (
    <DocPage name="CheckListItem" description="A row with a check icon, useful for feature/benefit lists.">
      <Example code={`<CheckListItem>Unlimited projects</CheckListItem>\n<CheckListItem>Priority support</CheckListItem>`}>
        <div className="flex flex-col gap-2">
          <CheckListItem>Unlimited projects</CheckListItem>
          <CheckListItem>Priority support</CheckListItem>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Text/content of the item." },
          { name: "className", type: "string", description: "Extra classes on the row wrapper." },
          { name: "...props", type: "HTMLAttributes<HTMLDivElement>", description: "Spread onto the wrapping div." },
        ]}
      />
    </DocPage>
  );
}
