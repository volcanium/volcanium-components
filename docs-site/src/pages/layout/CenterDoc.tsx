import { Center, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function CenterDoc() {
  return (
    <DocPage name="Center" description={"Conteneur pleine largeur qui centre son contenu horizontalement et verticalement."}>
      <Example code={`<Center className="h-24 bg-container rounded-lg">\n  <Button>Centered</Button>\n</Center>`}>
        <div className="w-full">
          <Center className="h-24 bg-container rounded-lg">
            <Button>Centered</Button>
          </Center>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Contenu à centrer." },
          { name: "className", type: "string", description: "Classes supplémentaires du conteneur." },
        ]}
      />
    </DocPage>
  );
}
