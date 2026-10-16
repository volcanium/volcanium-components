import type { Meta, StoryObj } from "@storybook/react";
import { IconTrash, IconPencil, IconCopy } from "@tabler/icons-react";
import IconButton from "./IconButton";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  tags: ["autodocs"],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Supprimer", children: <IconTrash size={16} /> },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex gap-1">
      <IconButton label="Modifier"><IconPencil size={16} /></IconButton>
      <IconButton label="Supprimer" disabled><IconTrash size={16} /></IconButton>
      <IconButton label="Copier" busy><IconCopy size={16} /></IconButton>
      <IconButton label="Copier (petit)" size="sm"><IconCopy size={12} /></IconButton>
    </div>
  ),
};
