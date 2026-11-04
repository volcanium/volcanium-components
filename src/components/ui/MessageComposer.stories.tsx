import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconMoodSmile, IconPaperclip } from "@tabler/icons-react";
import MessageComposer from "./MessageComposer";
import EmojiPicker from "./EmojiPicker";
import IconButton from "./IconButton";

const meta = { title: "UI/MessageComposer", component: MessageComposer, tags: ["autodocs"] } satisfies Meta<typeof MessageComposer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Saisie: Story = {
  args: { value: "", onChange: () => undefined, onSend: () => undefined, canSend: false, sendLabel: "Envoyer" },
  render: () => {
    const [value, setValue] = useState("Salut l'équipe, voici le point de la semaine.");
    const [emoji, setEmoji] = useState(false);
    return (
      <div className="bg-vc-back min-h-screen p-10 text-vc-text">
        <div className="mx-auto max-w-2xl">
          <MessageComposer
            value={value}
            onChange={setValue}
            onSend={() => setValue("")}
            canSend={value.trim().length > 0}
            sendLabel="Envoyer"
            placeholder="Écrire à #général"
            toolbar={<><IconButton label="Joindre un fichier" size="sm"><IconPaperclip size={16} /></IconButton><IconButton label="Emoji" size="sm" onClick={() => setEmoji((v) => !v)}><IconMoodSmile size={16} /></IconButton></>}
            popover={emoji ? <div className="absolute bottom-full left-0 z-20 mb-2"><EmojiPicker label="Choisir un emoji" onPick={(e) => { setValue((v) => v + e); setEmoji(false); }} /></div> : undefined}
          />
        </div>
      </div>
    );
  },
};

/** `attachments` : bandeau de vignettes au-dessus du champ ; clic = visionneuse, croix = retrait. */
export const AvecPiecesJointes: Story = {
  args: { value: "", onChange: () => undefined, onSend: () => undefined, canSend: false, sendLabel: "Envoyer" },
  render: () => {
    const [value, setValue] = useState("");
    const [files, setFiles] = useState<File[]>(() => [
      new File(["Notes de la réunion\n- point 1\n- point 2"], "notes.txt", { type: "text/plain" }),
      new File([new Uint8Array(2048)], "archive.zip", { type: "application/zip" }),
    ]);
    return (
      <div className="bg-vc-back min-h-screen p-10 text-vc-text">
        <div className="mx-auto max-w-2xl">
          <MessageComposer
            value={value}
            onChange={setValue}
            onSend={() => { setValue(""); setFiles([]); }}
            canSend={value.trim().length > 0 || files.length > 0}
            sendLabel="Envoyer"
            placeholder="Écrire à #général"
            attachments={files}
            onRemoveAttachment={(_, i) => setFiles((l) => l.filter((_, j) => j !== i))}
          />
        </div>
      </div>
    );
  },
};
