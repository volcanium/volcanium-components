import type { Meta, StoryObj } from "@storybook/react";
import TopNav from "./TopNav";
import { IconSettings, IconUser } from "@tabler/icons-react";

const meta = {
  title: "Layout/TopNav",
  component: TopNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Volcanium Studio",
    titleLink: "/",
    buttons: [
      { label: "Profile", page: "/profile", icon: <IconUser size={18} /> },
      { label: "Settings", page: "/settings", icon: <IconSettings size={18} /> },
    ],
  },
};

export const WithChildren: Story = {
  args: {
    title: "Volcanium Studio",
    titleLink: "/",
    buttons: [{ label: "Profile", page: "/profile", icon: <IconUser size={18} /> }],
    children: <span className="text-sm text-white/60">v1.2.1</span>,
  },
};
