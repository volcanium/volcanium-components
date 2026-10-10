import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Tabs from "./Tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { tabs: [], value: "a", onChange: () => undefined },
  render: () => {
    const [value, setValue] = useState("containers");
    return (
      <div className="p-10 bg-vc-back min-h-screen text-vc-text">
        <Tabs
          value={value}
          onChange={setValue}
          tabs={[
            { id: "containers", label: "Conteneurs", badge: 12, content: <p className="py-4">Liste des conteneurs</p> },
            { id: "images", label: "Images", content: <p className="py-4">Liste des images</p> },
            { id: "volumes", label: "Volumes", content: <p className="py-4">Liste des volumes</p> },
            { id: "networks", label: "Réseaux", content: <p className="py-4">Liste des réseaux</p> },
            { id: "soon", label: "Bientôt", disabled: true },
          ]}
        />
      </div>
    );
  },
};
