import type { Meta, StoryObj } from "@storybook/react";
import NotificationCard from "./NotificationCard";
import type { NotificationItem } from "./NotificationProvider";

const meta = { title: "UI/NotificationCard", component: NotificationCard, tags: ["autodocs"] } satisfies Meta<typeof NotificationCard>;
export default meta;
type Story = StoryObj<typeof meta>;

const call: NotificationItem = {
  id: "communication:call:1", source: "communication", kind: "call", title: "Julien Rilliot", bodyKey: "call_incoming", ring: true, silent: false, createdAt: 0, expiresAt: 180_000,
  actions: [{ id: "answer", href: "#" }, { id: "decline", request: { url: "#", method: "POST" } }, { id: "messages", href: "#" }],
};

export const AppelEntrant: Story = {
  args: { item: call, onAction: () => undefined, onDismiss: () => undefined },
  render: (args) => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex flex-col gap-4 max-w-sm">
      <NotificationCard {...args} />
      <NotificationCard {...args} item={{ ...call, id: "x", title: "Équipe design", subtitle: "#général", bodyKey: "call_incoming_audio" }} />
      <NotificationCard {...args} item={{ ...call, id: "y", kind: "mail", ring: false, title: "Nouveau message", body: "Le devis est prêt", actions: [{ id: "open", href: "#" }] }} />
    </div>
  ),
};
