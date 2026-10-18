import type { Meta, StoryObj } from "@storybook/react";
import Avatar from "./Avatar";

const meta = { title: "UI/Avatar", component: Avatar, tags: ["autodocs"] } satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Initiales: Story = {
  args: { name: "Julien Rilliot" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex items-center gap-3">
      <Avatar name="Julien Rilliot" />
      <Avatar name="Mélina" size={56} />
      <Avatar name="melina.david72@orange.fr" email="melina.david72@orange.fr" size={32} />
      <Avatar name="Sans photo valide" src="https://invalide.invalid/x.png" />
    </div>
  ),
};
