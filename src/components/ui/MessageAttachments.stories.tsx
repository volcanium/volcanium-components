import type { Meta, StoryObj } from "@storybook/react";
import MessageAttachments from "./MessageAttachments";
import MessageItem from "./MessageItem";

const svg = (bg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="${bg}"/></svg>`)}`;

const meta = { title: "UI/MessageAttachments", component: MessageAttachments, tags: ["autodocs"] } satisfies Meta<typeof MessageAttachments>;
export default meta;
type Story = StoryObj<typeof meta>;

/** À placer dans le `footer` de `MessageItem` : vignettes pour les images, puces pour le reste ; un clic ouvre la visionneuse. */
export const DansUnMessage: Story = {
  args: { items: [] },
  render: () => (
    <div className="min-h-screen bg-vc-back p-10 text-vc-text">
      <MessageItem
        author={{ name: "Camille Durand" }}
        time="14:32"
        footer={
          <MessageAttachments
            items={[
              { url: svg("#b8442a"), name: "maquette.svg", mime: "image/svg+xml", size: 18_400 },
              { url: svg("#2a6fb8"), name: "variante.svg", mime: "image/svg+xml", size: 21_900 },
              { url: "data:text/plain;charset=utf-8,Bonjour", name: "notes.txt", mime: "text/plain", size: 7 },
              { url: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==", name: "archive.zip", mime: "application/zip", size: 1_200_000 },
            ]}
          />
        }
      >
        Voici les maquettes et les notes.
      </MessageItem>
    </div>
  ),
};
