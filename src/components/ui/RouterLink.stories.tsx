import { MemoryRouter } from "react-router-dom";
import type { Meta, StoryObj } from "@storybook/react";
import RouterLink from "./RouterLink";

const meta = { title: "UI/RouterLink", component: RouterLink, tags: ["autodocs"] } satisfies Meta<typeof RouterLink>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { to: "/rules", children: "Voir les règles" },
  render: () => (
    <MemoryRouter>
      <div className="p-10 bg-vc-back min-h-screen text-vc-text space-y-2">
        <p>Configure les domaines dans <RouterLink to="/rules">les règles</RouterLink>.</p>
        <p><RouterLink to="/members" underline={false}>Souligné au survol seulement</RouterLink></p>
      </div>
    </MemoryRouter>
  ),
};
