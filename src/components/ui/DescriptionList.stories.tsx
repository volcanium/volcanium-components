import type { Meta, StoryObj } from "@storybook/react";
import DescriptionList from "./DescriptionList";

const meta = {
  title: "UI/DescriptionList",
  component: DescriptionList,
  tags: ["autodocs"],
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: [] },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text max-w-2xl">
      <DescriptionList
        items={[
          { label: "Adresse publique", value: <code>status.example.com</code> },
          { label: "Publication", value: "Publiée : visible de tous" },
          { label: "Fuseau horaire des jours", value: "Europe/Paris" },
        ]}
      />
    </div>
  ),
};
