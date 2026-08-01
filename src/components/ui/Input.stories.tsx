import type { Meta, StoryObj } from "@storybook/react";
import Input from "./Input";
import { Contaner } from "./Contaner";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Contaner title="Exemple input">
        <Story />
      </Contaner>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    children: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email Address",
    type: "email",
    children: "name@example.com",
  },
};

export const SecondaryVariant: Story = {
  args: {
    label: "Username",
    variant: "secondary",
    children: "Enter your username",
  },
};
