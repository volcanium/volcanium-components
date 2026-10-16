import type { Meta, StoryObj } from "@storybook/react";
import Chip from "./Chip";

const meta = { title: "UI/Chip", component: Chip, tags: ["autodocs"] } satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "exemple.com" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex flex-wrap gap-2">
      <Chip>exemple.com</Chip>
      <Chip onRemove={() => undefined} removeLabel="Retirer volcanium.fr">volcanium.fr</Chip>
      <Chip onRemove={() => undefined} removeLabel="Retirer studio.example">studio.example</Chip>
    </div>
  ),
};
