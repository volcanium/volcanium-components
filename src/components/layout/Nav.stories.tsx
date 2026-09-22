import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Nav from "./Nav";
import Button from "../ui/Button";

const meta = {
  title: "Layout/Nav",
  component: Nav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Nav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="h-[200vh] bg-vc-back">
      <Nav {...args} />
      <div className="p-10 text-white/70">
        Scroll down to see the sticky effect.
      </div>
    </div>
  ),
  args: {
    displayNav: true,
    brandName: "VOLCANIUM STUDIO",
    brandLink: "/",
    links: [
      { id: "home", label: "Home" },
      { id: "features", label: "Features" },
      { id: "pricing", label: "Pricing" },
    ],
    rightContent: <Button>Login</Button>,
    mobileBottomContent: <Button className="w-full">Contact Us</Button>,
  },
};

export const CustomClasses: Story = {
  render: (args) => (
    <div className="h-[200vh] bg-vc-back">
      <Nav {...args} />
      <div className="p-10 text-white/70">
        This Nav uses custom CSS classes for both desktop and mobile versions.
      </div>
    </div>
  ),
  args: {
    displayNav: true,
    brandName: "CUSTOM NAV",
    brandLink: "/",
    className: "bg-red-500/10 border-b border-red-500/20",
    classNameMobile: "bg-blue-500/10 border-b border-blue-500/20",
    links: [
      { id: "home", label: "Home" },
      { id: "features", label: "Features" },
      { id: "pricing", label: "Pricing" },
    ],
    rightContent: <Button>Login</Button>,
    mobileBottomContent: <Button className="w-full">Contact Us</Button>,
  },
};
