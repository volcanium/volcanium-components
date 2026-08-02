import type { Meta, StoryObj } from "@storybook/react";
import TooltipButton from "./TooltipButton";
import Button from "./Button";

const meta: Meta<typeof TooltipButton> = {
  title: "UI/TooltipButton",
  component: TooltipButton,
  tags: ["autodocs"],
  argTypes: {
    tooltip: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TooltipButton>;

export const Default: Story = {
  args: {
    tooltip: "Helpful tooltip text",
    children: <Button variant="tertiary">Hover me</Button>,
  },
};

export const LongTooltip: Story = {
  args: {
    tooltip:
      "This is a much longer tooltip that might provide more detailed information about the button action.",
    children: <Button variant="tertiary">Hover me for more info</Button>,
  },
};
