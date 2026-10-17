import type { Meta, StoryObj } from "@storybook/react";
import Badge from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  args: { children: "En ligne" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex flex-col gap-1">
      <Badge tone="success">En ligne</Badge>
      <Badge tone="warning">Dégradé</Badge>
      <Badge tone="danger">Hors ligne</Badge>
      <Badge tone="info">En cours</Badge>
      <Badge tone="wait">En attente</Badge>
      <Badge tone="neutral">Révoqué</Badge>
    </div>
  ),
};
