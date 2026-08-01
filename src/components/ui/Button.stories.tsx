import type { Meta, StoryObj } from "@storybook/react";

import Button from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
    children: "Tertiary Button",
  },
};

export const Lum: Story = {
  args: {
    variant: "lum",
    children: "Lum Button",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    loading: true,
    children: "Loading...",
  },
};
