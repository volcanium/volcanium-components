import type { Meta, StoryObj } from "@storybook/react";
import Toggle from "./Toggle";
import { Container } from "./Container";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Container title="Exemple toggle">
        <Story />
      </Container>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    checked: false,
    label: "Activer l'option",
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    label: "Option activée",
  },
};

export const Loading: Story = {
  args: {
    checked: true,
    label: "Enregistrement en cours",
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    label: "Option désactivée",
    disabled: true,
  },
};
