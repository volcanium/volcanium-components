import { Textarea } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function TextareaDoc() {
  return (
    <DocPage name="Textarea" description={"Zone de texte multiligne avec libellé facultatif, deux styles de fond et redimensionnement réglable."}>
      <Example code={`<Textarea placeholder="Write something..." />\n<Textarea variant="secondary" label="Bio" resize="none" />`}>
        <Textarea placeholder="Write something..." />
        <Textarea variant="secondary" label="Bio" resize="none" />
      </Example>
      <PropsTable
        rows={[
          { name: "label", type: "ReactNode", description: "Libellé affiché sous la zone de texte." },
          { name: "variant", type: '"one" | "secondary"', default: '"one"', description: "Couleur de fond." },
          { name: "resize", type: '"none" | "vertical" | "horizontal" | "both"', default: '"vertical"', description: "Redimensionnement." },
          { name: "id", type: "string", description: "Identifiant (généré automatiquement par défaut)." },
          { name: "className", type: "string", description: "Classes supplémentaires." },
          { name: "...props", type: "TextareaHTMLAttributes<HTMLTextAreaElement>", description: "Toute propriété native d'un textarea." },
        ]}
      />
    </DocPage>
  );
}
