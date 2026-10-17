import type { Meta, StoryObj } from "@storybook/react";
import ExternalLink from "./ExternalLink";

const meta = {
  title: "UI/ExternalLink",
  component: ExternalLink,
  tags: ["autodocs"],
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: "https://example.com", children: "example.com" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text space-y-2">
      <p><ExternalLink href="https://example.com">Ouvre dans un nouvel onglet</ExternalLink></p>
      <p><ExternalLink download href="/export.csv">Télécharge un fichier</ExternalLink></p>
    </div>
  ),
};
