import type { Meta, StoryObj } from "@storybook/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import ListRow from "./ListRow";
import IconButton from "./IconButton";

const meta = {
  title: "UI/ListRow",
  component: ListRow,
  tags: ["autodocs"],
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Site web" },
  render: () => (
    <ul className="p-10 bg-vc-back min-h-screen text-vc-text space-y-2 max-w-2xl">
      <ListRow
        title="Site web"
        tag="groupe « Applications »"
        subtitle="Contrôles : [smoke] example http · pannes détectées automatiquement"
        actions={<><IconButton label="Modifier"><IconPencil size={16} /></IconButton><IconButton label="Retirer"><IconTrash size={16} /></IconButton></>}
      />
    </ul>
  ),
};
