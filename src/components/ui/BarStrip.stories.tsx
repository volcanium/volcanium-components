import type { Meta, StoryObj } from "@storybook/react";
import BarStrip from "./BarStrip";

const meta = {
  title: "UI/BarStrip",
  component: BarStrip,
  tags: ["autodocs"],
} satisfies Meta<typeof BarStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Dernières 24 h", items: [] },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text max-w-xl">
      <BarStrip
        label="Dernières 24 h"
        items={Array.from({ length: 24 }, (_, i) => ({
          key: String(i),
          color: i === 9 ? "bg-vc-danger" : i === 14 ? "bg-vc-warning" : "bg-vc-success",
          title: `${String(i).padStart(2, "0")}:00`,
          lines: i === 9 ? ["3 échecs sur 4 mesures"] : ["Aucun échec"],
          ariaLabel: `${i} h`,
        }))}
      />
    </div>
  ),
};
