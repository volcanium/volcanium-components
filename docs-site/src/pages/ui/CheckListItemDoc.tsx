import { CheckListItem } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function CheckListItemDoc() {
  return (
    <DocPage name="CheckListItem" description="Ligne avec une coche, pour les listes d'avantages.">
      <Example code={`<CheckListItem>Unlimited projects</CheckListItem>\n<CheckListItem>Priority support</CheckListItem>`}>
        <div className="flex flex-col gap-2">
          <CheckListItem>Unlimited projects</CheckListItem>
          <CheckListItem>Priority support</CheckListItem>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Contenu de la ligne." },
          { name: "className", type: "string", description: "Classes supplémentaires de la ligne." },
          { name: "...props", type: "HTMLAttributes<HTMLDivElement>", description: "Transmises au conteneur." },
        ]}
      />
    </DocPage>
  );
}
