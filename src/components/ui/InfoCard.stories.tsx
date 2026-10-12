import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import InfoCard, { InfoGrid } from "./InfoCard";

const meta = { title: "UI/InfoCard", component: InfoCard, tags: ["autodocs"] } satisfies Meta<typeof InfoCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {
  args: { label: "Port", value: "3000" },
  render: () => {
    const [port, setPort] = useState("3000");
    const [mode, setMode] = useState("web");
    return (
      <div className="p-10 bg-vc-back min-h-screen text-vc-text">
        <InfoGrid>
          <InfoCard label="Port" value={port} editable editType="number" onSave={(v) => setPort(v)} validate={(v) => (Number(v) > 0 ? null : "Port invalide")} />
          <InfoCard label="Type" value={mode} editable editType="select" options={[{ label: "web", value: "web" }, { label: "worker", value: "worker" }]} onSave={(v) => setMode(v)} />
          <InfoCard label="Image" value="ghcr.io/volcanium/deploy-hello:v2" mono hint="Lecture seule" />
        </InfoGrid>
      </div>
    );
  },
};
