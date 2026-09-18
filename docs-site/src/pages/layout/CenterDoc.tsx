import { Center, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function CenterDoc() {
  return (
    <DocPage name="Center" description="Flex wrapper that centers its children both horizontally and vertically, full width.">
      <Example code={`<Center className="h-24 bg-container rounded-lg">\n  <Button>Centered</Button>\n</Center>`}>
        <div className="w-full">
          <Center className="h-24 bg-container rounded-lg">
            <Button>Centered</Button>
          </Center>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Content to center." },
          { name: "className", type: "string", description: "Extra classes on the wrapper." },
        ]}
      />
    </DocPage>
  );
}
