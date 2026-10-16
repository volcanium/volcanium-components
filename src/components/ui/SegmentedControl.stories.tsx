import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import SegmentedControl from "./SegmentedControl";

const meta = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Période affichée", options: [], value: 30, onChange: () => undefined },
  render: () => {
    const [days, setDays] = useState(30);
    return (
      <div className="p-10 bg-vc-back min-h-screen text-vc-text">
        <SegmentedControl label="Période affichée" value={days} onChange={setDays} options={[7, 30, 90].map((n) => ({ value: n, label: `${n} jours` }))} />
      </div>
    );
  },
};
