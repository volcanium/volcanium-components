import type { Meta, StoryObj } from "@storybook/react";
import Disclosure from "./Disclosure";

const meta = {
  title: "UI/Disclosure",
  component: Disclosure,
  tags: ["autodocs"],
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { summary: "Options avancées", children: "Contenu" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text max-w-xl space-y-3">
      <Disclosure summary="Options avancées">Contenu replié par défaut.</Disclosure>
      <Disclosure bordered defaultOpen summary="Chronologie (3)">Ouvert au départ, encadré.</Disclosure>
    </div>
  ),
};
