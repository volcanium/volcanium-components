import type { Meta, StoryObj } from "@storybook/react";
import SimpleTable from "./SimpleTable";

const meta = {
  title: "UI/SimpleTable",
  component: SimpleTable,
  tags: ["autodocs"],
} satisfies Meta<typeof SimpleTable>;

export default meta;
type Story = StoryObj<typeof meta>;

type Rec = { type: string; name: string; value: string };
const rows: Rec[] = [
  { type: "TXT", name: "_volcanium.status.example.com", value: "vd-verify=abc123" },
  { type: "CNAME", name: "status.example.com", value: "panel.example.net" },
];

export const Default: Story = {
  args: { caption: "", columns: [], rows: [], rowKey: () => "" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text max-w-2xl">
      <SimpleTable<Rec>
        dense
        caption="Enregistrements DNS à créer"
        rows={rows}
        rowKey={(r) => r.type}
        columns={[
          { key: "type", header: "Type", render: (r) => r.type },
          { key: "name", header: "Nom", className: "break-all", render: (r) => <code>{r.name}</code> },
          { key: "value", header: "Valeur", className: "break-all", render: (r) => <code>{r.value}</code> },
        ]}
      />
    </div>
  ),
};

export const Empty: Story = {
  args: { caption: "", columns: [], rows: [], rowKey: () => "" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text max-w-2xl">
      <SimpleTable<Rec> caption="Vide" rows={[]} rowKey={(r) => r.type} empty="Aucun enregistrement." columns={[{ key: "type", header: "Type", render: (r) => r.type }]} />
    </div>
  ),
};
