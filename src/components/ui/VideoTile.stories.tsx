import type { Meta, StoryObj } from "@storybook/react";
import VideoTile from "./VideoTile";
import ControlBar from "./ControlBar";
import ControlButton from "./ControlButton";
import { IconMicrophone, IconMicrophoneOff, IconPhoneOff, IconScreenShare, IconUsers, IconVideo } from "@tabler/icons-react";

const meta = { title: "UI/VideoTile", component: VideoTile, tags: ["autodocs"] } satisfies Meta<typeof VideoTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Reunion: Story = {
  args: { name: "Julien Rilliot" },
  render: () => (
    <div className="bg-vc-back min-h-screen p-10 text-vc-text space-y-6">
      <div className="grid max-w-3xl grid-cols-2 gap-3">
        <VideoTile name="Julien Rilliot" badge="Vous" speaking />
        <VideoTile name="Mélina David" micOff micOffLabel="Micro coupé" />
        <VideoTile name="Sam Invité" badge="Invité" handRaised handLabel="Main levée" />
        <VideoTile name="Alex Martin" />
      </div>
      <ControlBar label="Commandes de la réunion" className="w-fit">
        <ControlButton label="Couper le micro" icon={<IconMicrophone size={20} />} />
        <ControlButton label="Réactiver le micro" icon={<IconMicrophoneOff size={20} />} active />
        <ControlButton label="Caméra" icon={<IconVideo size={20} />} />
        <ControlButton label="Partager l'écran" icon={<IconScreenShare size={20} />} />
        <ControlButton label="Participants" icon={<IconUsers size={20} />} count={4} />
        <ControlButton label="Quitter" icon={<IconPhoneOff size={20} />} danger />
      </ControlBar>
    </div>
  ),
};
