import { Hero, Title, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function HeroDoc() {
  return (
    <DocPage name="Hero" description={"Section pleine hauteur avec image de fond, assombrissement facultatif et zone en bas (par exemple un bouton)."}>
      <Example code={`<Hero img="https://picsum.photos/1600/900" darkened={50} bottom={<Button>Scroll down</Button>}>\n  <Title className="text-5xl">Welcome</Title>\n</Hero>`}>
        <div className="w-full h-72 rounded-lg overflow-hidden relative">
          <Hero img="https://picsum.photos/1600/900" darkened={50} bottom={<Button>Scroll down</Button>}>
            <Title className="text-5xl">Welcome</Title>
          </Hero>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "img", type: "string", description: "Adresse de l'image de fond." },
          { name: "children", type: "ReactNode", description: "Contenu centré sur l'image." },
          { name: "darkened", type: "number", default: "0", description: "Assombrissement, de 0 à 100." },
          { name: "bottom", type: "ReactNode", description: "Contenu fixé en bas de la section." },
          { name: "className", type: "string", description: "Classes supplémentaires de la section." },
        ]}
      />
    </DocPage>
  );
}
