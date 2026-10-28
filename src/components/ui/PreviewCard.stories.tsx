import { IconPresentation } from "@tabler/icons-react";
import type { Meta, StoryObj } from "@storybook/react";
import PreviewCard from "./PreviewCard";

const meta = { title: "UI/PreviewCard", component: PreviewCard, tags: ["autodocs"] } satisfies Meta<typeof PreviewCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Atelier produit", subtitle: "Modifié il y a 2 h · Julien", onOpen: () => undefined, placeholder: <IconPresentation size={40} /> },
  render: (args) => (
    <div className="grid max-w-3xl grid-cols-3 gap-4 bg-vc-back p-10 text-vc-text">
      <PreviewCard {...args} />
      <PreviewCard {...args} title="Rétrospective" subtitle="Vide" />
    </div>
  ),
};
