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

const base = { source: "demo", ring: false, silent: false, createdAt: 0, expiresAt: 8_000 } as const;
const message: NotificationItem = { ...base, id: "m", kind: "message", title: "Camille Durand", subtitle: "#général", body: "On se voit à 14 h pour la démo ? J'ai préparé les maquettes.", priority: "high", actions: [{ id: "open", href: "#" }, { id: "reply", href: "#" }] };
const mail: NotificationItem = { ...base, id: "ma", kind: "mail", title: "Atelier Lumière", subtitle: "Re : Devis du 12 octobre", body: "Bonjour, voici les remarques sur la dernière version…", actions: [{ id: "open", href: "#" }] };
const invoice: NotificationItem = { ...base, id: "i", kind: "invoice", title: "Facture F-2026-0142 payée", body: "1 240,00 € reçus de Studio Nord", actions: [{ id: "open", href: "#" }] };
const noop = () => undefined;

export const Message: Story = { args: { item: message, onAction: noop, onDismiss: noop } };
export const Mail: Story = { args: { item: mail, onAction: noop, onDismiss: noop } };
export const Facture: Story = { args: { item: invoice, onAction: noop, onDismiss: noop } };
export const Sortie: Story = { args: { item: mail, leaving: true, onAction: noop, onDismiss: noop } };
