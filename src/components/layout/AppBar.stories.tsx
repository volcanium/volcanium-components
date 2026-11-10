import type { Meta, StoryObj } from "@storybook/react";
import { IconSettings, IconShare3 } from "@tabler/icons-react";
import AppBar, { AppBarTitle } from "./AppBar";
import IconButton from "../ui/IconButton";
import Badge from "../ui/Badge";

const meta: Meta<typeof AppBar> = { title: "Layout/AppBar", component: AppBar, parameters: { layout: "fullscreen" } };
export default meta;

export const Document: StoryObj<typeof AppBar> = {
  render: () => (
    <AppBar
      backLabel="Retour"
      onBack={() => undefined}
      title={<AppBarTitle title="Budget 2027" suffix=".xlsx" canRename onRename={() => undefined} label="Nom du fichier" />}
      status={<Badge tone="success">En direct</Badge>}
      people={[{ id: "1", name: "Ana Martin" }, { id: "2", name: "Bob Durand" }]}
      peopleLabel="2 personnes"
    >
      <IconButton label="Partager"><IconShare3 size={16} /></IconButton>
      <IconButton label="Réglages"><IconSettings size={16} /></IconButton>
    </AppBar>
  ),
};
