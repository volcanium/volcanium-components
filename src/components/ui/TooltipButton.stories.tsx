import type { Meta, StoryObj } from '@storybook/react';
import TooltipButton from './TooltipButton';

const meta: Meta<typeof TooltipButton> = {
  title: 'UI/TooltipButton',
  component: TooltipButton,
  tags: ['autodocs'],
  argTypes: {
    tooltip: { control: 'text' },
  },
  parameters: {
    layout: 'centered',
  }
};

export default meta;
type Story = StoryObj<typeof TooltipButton>;

export const Default: Story = {
  args: {
    tooltip: 'Helpful tooltip text',
    children: (
      <button className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">
        Hover me
      </button>
    ),
  },
};

export const LongTooltip: Story = {
  args: {
    tooltip: 'This is a much longer tooltip that might provide more detailed information about the button action.',
    children: (
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
        Hover me for more info
      </button>
    ),
  },
};
