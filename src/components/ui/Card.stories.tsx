import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Réglages de la page", description: "Une phrase d’explication sous le titre." },
  render: (args) => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text max-w-xl space-y-3">
      <Card {...args}>Contenu de la carte</Card>
      <Card compact as="div">Version compacte</Card>
    </div>
  ),
};
