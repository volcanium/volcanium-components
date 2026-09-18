import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "./Container";
import { InformationButton } from "./InformationButton";

const meta: Meta<typeof Container> = {
  title: "UI/Container",
  component: Container,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    title: "Default Container",
    children: <div className="p-4 text-white">Content goes here</div>,
  },
};

export const WithLink: Story = {
  args: {
    title: "Clickable Container",
    link: "/example-route",
    children: (
      <div className="p-4 text-white">This container acts as a link.</div>
    ),
  },
};

export const InfoButtonExample: StoryObj<typeof InformationButton> = {
  render: (args) => (
    <Container title="Info button">
      <InformationButton {...args} />
    </Container>
  ),
  args: {
    info: {
      name: "Profile Setting",
      title: "Username",
      value: "john_doe_99",
    },
  },
};
