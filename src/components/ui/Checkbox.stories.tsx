import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Checkbox from "./Checkbox";

const meta = { title: "UI/Checkbox", component: Checkbox, tags: ["autodocs"] } satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { checked: false, onChange: () => undefined },
  render: () => {
    const [a, setA] = useState(true);
    const [b, setB] = useState(false);
    return (
      <div className="p-10 bg-vc-back min-h-screen text-vc-text space-y-3 max-w-md">
        <Checkbox checked={a} onChange={setA} label="J’accepte les conditions générales" hint="Obligatoire pour continuer." />
        <Checkbox checked={b} onChange={setB} label="Recevoir les alertes par e-mail" />
        <Checkbox checked onChange={() => undefined} label="Désactivée" disabled />
      </div>
    );
  },
};
