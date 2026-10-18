import { IconMail, IconPhone } from "@tabler/icons-react";
import type { Meta, StoryObj } from "@storybook/react";
import ProfilePopover from "./ProfilePopover";
import Tag from "./Tag";
import Button from "./Button";

const meta = { title: "UI/ProfilePopover", component: ProfilePopover, tags: ["autodocs"] } satisfies Meta<typeof ProfilePopover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Externe: Story = {
  args: { name: "Mélina", tabs: [] , children: null },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text">
      <p className="text-sm">
        Message de{" "}
        <ProfilePopover
          name="Mélina"
          email="melina.david72@orange.fr"
          tag={<Tag>Externe</Tag>}
          actions={<Button icon={<IconMail size={16} />}>Écrire</Button>}
          tabs={[
            { id: "overview", label: "Vue d'ensemble", content: <p className="text-sm">Autre adresse e-mail : melina.david72@orange.fr</p> },
            { id: "contact", label: "Contact", content: <p className="flex items-center gap-2 text-sm"><IconPhone size={16} /> Non renseigné</p> },
            { id: "files", label: "Fichiers", badge: 2, content: <p className="text-sm">facture.pdf, logo.png</p> },
            { id: "messages", label: "Messages", content: <p className="text-sm">RE: Rajout compte Instagram et Facebook</p> },
          ]}
        >
          Mélina
        </ProfilePopover>
      </p>
    </div>
  ),
};
