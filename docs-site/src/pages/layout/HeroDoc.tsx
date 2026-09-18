import { Hero, Title, Button } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function HeroDoc() {
  return (
    <DocPage name="Hero" description="Full-viewport-height background image section with an optional darkening overlay and a bottom slot (e.g. a scroll-down cue or CTA).">
      <Example code={`<Hero img="https://picsum.photos/1600/900" darkened={50} bottom={<Button>Scroll down</Button>}>\n  <Title className="text-5xl">Welcome</Title>\n</Hero>`}>
        <div className="w-full h-72 rounded-lg overflow-hidden relative">
          <Hero img="https://picsum.photos/1600/900" darkened={50} bottom={<Button>Scroll down</Button>}>
            <Title className="text-5xl">Welcome</Title>
          </Hero>
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "img", type: "string", description: "Background image URL." },
          { name: "children", type: "ReactNode", description: "Centered content over the image." },
          { name: "darkened", type: "number", default: "0", description: "Overlay darkness, 0-100." },
          { name: "bottom", type: "ReactNode", description: "Content pinned to the bottom of the section." },
          { name: "className", type: "string", description: "Extra classes on the <section>." },
        ]}
      />
    </DocPage>
  );
}
