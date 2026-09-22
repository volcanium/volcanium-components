import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ToastProvider from "./../ui/Toast";
import Sidebar from "./Sidebar";
import {
  IconUser,
  IconUserFilled,
  IconSettings,
  IconSettingsFilled,
  IconLogout2,
  IconBrandTabler,
  IconBrandTablerFilled,
  IconLock,
  IconLockFilled,
  IconWallet,
  IconApps,
  IconAppsFilled,
  IconLayersLinked,
} from "@tabler/icons-react";
import { notify } from "./../ui/notify";

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  {
    name: "My Information",
    icon: IconUser,
    iconFilled: IconUserFilled,
    page: "/account",
  },
  {
    name: "Security",
    icon: IconLock,
    iconFilled: IconLockFilled,
    page: "/account/security",
    alert: true,
  },
  { name: "My Purchases", icon: IconWallet, page: "/account/purchases" },
  {
    name: "My Subscriptions",
    icon: IconApps,
    iconFilled: IconAppsFilled,
    page: "/account/subscriptions",
  },
  {
    name: "Linked Services",
    icon: IconLayersLinked,
    page: "/account/services",
  },
  {
    name: "Settings",
    icon: IconSettings,
    iconFilled: IconSettingsFilled,
    page: "/account/settings",
  },
];

const bottomTabs = [
  {
    name: "Logout",
    icon: IconLogout2,
    notActive: true,
    onClick: () => notify.info("Logout clicked!"),
  },
];

const specificTabs = [
  {
    groupName: "Admin",
    role: "admin",
    tabs: [
      {
        name: "Admin Panel",
        icon: IconBrandTabler,
        iconFilled: IconBrandTablerFilled,
        page: "/admin",
      },
    ],
  },
];

export const Default: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(true);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const location = useLocation();

    // Use current location from react-router if the user clicks a link,
    // otherwise fallback to the default arg if we're on the Storybook default iframe path
    const currentPath =
      location.pathname.includes("iframe.html") || location.pathname === "/"
        ? args.activePath
        : location.pathname;

    return (
      <ToastProvider>
        <Sidebar
          {...args}
          isOpen={isOpen}
          onToggle={setIsOpen}
          activePath={currentPath}
        >
          <div className="p-10 w-full h-full bg-vc-back text-vc-text flex items-center justify-center">
            <div className="bg-vc-container p-8 rounded-2xl w-full max-w-4xl border border-white/5 shadow-2xl">
              <h1 className="text-4xl font-vc-title text-vc-secondary mb-4">
                Main Content
              </h1>
              <p className="text-white/70 text-lg">
                This is a simulated content area. It perfectly aligns next to
                the sidebar and scrolls independently. The sidebar is now
                perfectly customized, perfectly responsive, and exactly
                identical to the original application.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="h-32 bg-vc-main/20 rounded-xl border border-vc-main/30 flex items-center justify-center text-vc-main font-semibold">
                  Widget 1
                </div>
                <div className="h-32 bg-vc-secondary/10 rounded-xl border border-vc-secondary/20 flex items-center justify-center text-vc-secondary font-semibold">
                  Widget 2
                </div>
              </div>
            </div>
          </div>
        </Sidebar>
      </ToastProvider>
    );
  },
  args: {
    title: "Account",
    subtitle: "Volcanium",
    activePath: "/account",
    user: {
      name: "Timéo",
      roleName: "Administrateur",
      role: "admin",
      initials: "T",
    },
    tabs: tabs,
    specificTabs: specificTabs,
    bottomTabs: bottomTabs,
    onUserModif: () => notify.info("Edit User clicked"),
  },
};

export const WithoutBranding: Story = {
  ...Default,
  args: {
    ...Default.args,
    showBranding: false,
  },
};
