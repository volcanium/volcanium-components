import type { Meta, StoryObj } from "@storybook/react";
import QrCode from "./QrCode";

const meta = { title: "UI/QrCode", component: QrCode, tags: ["autodocs"] } satisfies Meta<typeof QrCode>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "https://volcanium.eu", label: "Ouvre volcanium.eu", size: 200 },
  render: (args) => <div className="bg-vc-back p-10"><QrCode {...args} /></div>,
};
