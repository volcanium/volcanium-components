import type { Meta, StoryObj } from "@storybook/react";
import TextButton from "./TextButton";

const meta = {
  title: "UI/TextButton",
  component: TextButton,
  tags: ["autodocs"],
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Réessayer" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text space-y-2">
      <p>Actualisation impossible. <TextButton underline>Réessayer</TextButton></p>
      <p><TextButton>Nom cliquable d’une ligne</TextButton></p>
    </div>
  ),
};
