import type { Meta, StoryObj } from "@storybook/react";
import { IconUpload } from "@tabler/icons-react";
import FilePicker from "./FilePicker";

const meta = {
  title: "UI/FilePicker",
  component: FilePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof FilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Déployer un zip", onPick: () => undefined },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text">
      <FilePicker icon={<IconUpload size={18} />} accept=".zip" onPick={() => undefined}>Déployer un zip</FilePicker>
    </div>
  ),
};
