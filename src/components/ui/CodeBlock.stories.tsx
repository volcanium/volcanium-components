import type { Meta, StoryObj } from "@storybook/react";
import CodeBlock from "./CodeBlock";

const meta = {
  title: "UI/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "$ docker ps\nCONTAINER ID   IMAGE   STATUS\n3f2a9c1d7e4b   nginx   Up 2 hours" },
  render: (args) => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text max-w-xl">
      <CodeBlock {...args} />
    </div>
  ),
};
