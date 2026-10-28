import type { Meta, StoryObj } from "@storybook/react";
import AvatarStack from "./AvatarStack";

const meta = { title: "UI/AvatarStack", component: AvatarStack, tags: ["autodocs"] } satisfies Meta<typeof AvatarStack>;
export default meta;
type Story = StoryObj<typeof meta>;

const people = ["Ana Martin", "Bob Durand", "Clara Roux", "David Petit", "Emma Blanc", "Farid Noir"].map((name, i) => ({ id: String(i), name, color: ["#ff714d", "#4d9fff", "#3ecf8e", "#c084fc", "#f5c542", "#ef4444"][i] }));

export const Default: Story = {
  args: { people, label: "6 personnes présentes" },
  render: (args) => <div className="bg-vc-back p-10 text-vc-text"><AvatarStack {...args} /></div>,
};
