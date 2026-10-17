import type { Meta, StoryObj } from "@storybook/react";
import { IconExternalLink } from "@tabler/icons-react";
import LinkButton from "./LinkButton";

const meta = {
  title: "UI/LinkButton",
  component: LinkButton,
  tags: ["autodocs"],
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: "https://example.com", children: "Ouvrir" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex gap-2">
      <LinkButton href="https://example.com" icon={<IconExternalLink size={14} />}>Ouvrir</LinkButton>
      <LinkButton download href="/journal.csv">Télécharger en CSV</LinkButton>
    </div>
  ),
};
