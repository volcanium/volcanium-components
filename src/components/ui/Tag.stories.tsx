import type { Meta, StoryObj } from "@storybook/react";
import Tag from "./Tag";

const meta = {
  title: "UI/Tag",
  component: Tag,
  tags: ["autodocs"],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  args: { children: "Privée" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex gap-2">
      <Tag>Privée</Tag>
      <Tag tone="success">Publiée</Tag>
      <Tag tone="warning">Masqué des clients</Tag>
      <Tag tone="danger">Échec</Tag>
      <Tag tone="info">Visible sur : Page publique</Tag>
    </div>
  ),
};
