import type { Meta, StoryObj } from "@storybook/react";
import { IconMoodSmile, IconMessageReply } from "@tabler/icons-react";
import MessageItem from "./MessageItem";
import ReactionPill from "./ReactionPill";
import IconButton from "./IconButton";

const meta = { title: "UI/MessageItem", component: MessageItem, tags: ["autodocs"] } satisfies Meta<typeof MessageItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Conversation: Story = {
  args: { author: { name: "Julien Rilliot" }, time: "14:32", children: "Salut l'équipe" },
  render: () => (
    <div className="bg-vc-back min-h-screen p-10 text-vc-text">
      <div className="mx-auto max-w-2xl space-y-1">
        <MessageItem
          author={{ name: "Mélina David" }}
          time="14:32"
          timeTitle="mardi 21 octobre 2026, 14:32"
          actions={<><IconButton label="Réagir" size="sm"><IconMoodSmile size={14} /></IconButton><IconButton label="Répondre" size="sm"><IconMessageReply size={14} /></IconButton></>}
          footer={<><ReactionPill emoji="👍" count={3} active title="Julien, Mélina, Sam" /><ReactionPill emoji="🎉" count={1} /></>}
        >
          Le plan de migration est prêt, vous pouvez le relire avant la réunion de 16 h.
        </MessageItem>
        <MessageItem author={{ name: "Mélina David" }} time="14:33" compact editedLabel="modifié">
          J'ai ajouté la partie sur la reprise des données.
        </MessageItem>
        <MessageItem author={{ name: "Julien Rilliot" }} time="14:40" highlighted>
          Parfait, je regarde ça maintenant.
        </MessageItem>
      </div>
    </div>
  ),
};
