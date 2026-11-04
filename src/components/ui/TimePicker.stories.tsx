import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import TimePicker from "./TimePicker";

const meta: Meta<typeof TimePicker> = {
  title: "UI/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minHeight: "320px", width: "200px", paddingTop: "1rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

function Controlled(args: React.ComponentProps<typeof TimePicker>) {
  const [value, setValue] = useState(args.value ?? "");
  return (
    <div className="flex flex-col gap-2">
      <TimePicker {...args} value={value} onChange={setValue} />
      <code className="text-xs text-vc-text/60">value = {JSON.stringify(value)}</code>
    </div>
  );
}

/** Tapez `0930`, `9h30`, `9:30` ou `9` (= 09:00), ou choisissez un créneau dans la liste (flèche bas). */
export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Heure de début" },
};

export const HalfHourSteps: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Créneaux de 30 min", step: 30, value: "14:00" },
};

export const Disabled: Story = {
  args: { label: "Désactivé", value: "08:15", disabled: true },
};
