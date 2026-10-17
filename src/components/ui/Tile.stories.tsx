import { useState } from "react";
import { IconBuilding, IconUser } from "@tabler/icons-react";
import type { Meta, StoryObj } from "@storybook/react";
import Tile from "./Tile";

const meta = { title: "UI/Tile", component: Tile, tags: ["autodocs"] } satisfies Meta<typeof Tile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Compte personnel" },
  render: () => {
    const [plan, setPlan] = useState("pro");
    return (
      <div className="p-10 bg-vc-back min-h-screen text-vc-text space-y-3 max-w-md">
        <Tile icon={<IconUser size={18} />} title="Compte personnel" description="julien@example.com" />
        <Tile icon={<IconBuilding size={18} />} title="Volcanium Studio" description="Entreprise · propriétaire" />
        <Tile selected={plan === "free"} onClick={() => setPlan("free")} title="Gratuit" description="1 projet" trailing="0 €" />
        <Tile selected={plan === "pro"} onClick={() => setPlan("pro")} title="Pro" description="Projets illimités" trailing="9 €/mois" />
      </div>
    );
  },
};
