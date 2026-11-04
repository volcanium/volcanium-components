import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DatePicker from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "UI/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minHeight: "420px", width: "320px", paddingTop: "1rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

function Controlled(args: React.ComponentProps<typeof DatePicker>) {
  const [value, setValue] = useState<string>(typeof args.value === "string" ? args.value : "");
  return (
    <div className="flex flex-col gap-2">
      <DatePicker {...args} value={value} onChange={setValue} />
      <code className="text-xs text-vc-text/60">value = {JSON.stringify(value)}</code>
    </div>
  );
}

/** Tapez `0411` puis `2026`, ou `4/11/26`, `04.11.2026`, `2026-11-04` : validé à Entrée ou en quittant le champ. Flèche bas = calendrier. */
export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Date de début" },
};

export const English: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Start date", language: "en", value: "2026-11-04" },
};

export const WithLimits: Story = {
  render: (args) => <Controlled {...args} />,
  args: { label: "Dans le mois à venir", minDate: new Date(), maxDate: new Date(Date.now() + 30 * 86400000) },
};

export const Disabled: Story = {
  args: { label: "Désactivé", value: "2026-11-04", disabled: true },
};
