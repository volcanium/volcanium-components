import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DateTimePicker from "./DateTimePicker";

const meta: Meta<typeof DateTimePicker> = {
  title: "UI/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minHeight: "420px", width: "420px", paddingTop: "1rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

function Controlled(args: React.ComponentProps<typeof DateTimePicker>) {
  const [value, setValue] = useState(args.value ?? "");
  return (
    <div className="flex flex-col gap-2">
      <DateTimePicker {...args} value={value} onChange={setValue} />
      <code className="text-xs text-vc-text/60">value = {JSON.stringify(value)}</code>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Rappel" },
};

export const Prefilled: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Échéance", value: "2026-11-04T14:30" },
};
