import type { Meta, StoryObj } from "@storybook/react";
import Textarea from "./Textarea";
import { Container } from "./Container";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Container title="Exemple textarea">
        <Story />
      </Container>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Description",
    placeholder: "Write your description here...",
    rows: 5,
  },
};

export const SecondaryVariant: Story = {
  args: {
    label: "Notes",
    variant: "secondary",
    placeholder: "Add some notes...",
    rows: 4,
  },
};

export const NoResize: Story = {
  args: {
    label: "Fixed size",
    placeholder: "This textarea cannot be resized...",
    resize: "none",
    rows: 3,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    placeholder: "You cannot edit this...",
    disabled: true,
    rows: 3,
  },
};
