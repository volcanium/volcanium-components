import type { Meta, StoryObj } from "@storybook/react";
import Avatar from "../components/ui/Avatar";
import PresenceDot, { PRESENCE_STATUSES } from "./PresenceDot";

const meta = { title: "UI/PresenceDot", component: PresenceDot, tags: ["autodocs"] } satisfies Meta<typeof PresenceDot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Statuts: Story = {
  args: { status: "online" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {PRESENCE_STATUSES.map((s) => (
          <PresenceDot key={s} status={s} size={16} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        {PRESENCE_STATUSES.map((s) => (
          <Avatar key={s} name="Julien Rilliot" status={s} size={48} />
        ))}
      </div>
    </div>
  ),
};
