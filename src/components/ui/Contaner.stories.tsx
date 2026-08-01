import type { Meta, StoryObj } from "@storybook/react";
import { Contaner, InformationButton } from "./Contaner";

const meta: Meta<typeof Contaner> = {
  title: "UI/Contaner",
  component: Contaner,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Contaner>;

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
    <Contaner title="Info button">
      <InformationButton {...args} />
    </Contaner>
  ),
  args: {
    info: {
      name: "Profile Setting",
      title: "Username",
      value: "john_doe_99",
    },
  },
};
