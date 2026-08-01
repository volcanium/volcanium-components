import type { Meta, StoryObj } from '@storybook/react';
import Title from './Title';

const meta: Meta<typeof Title> = {
  title: 'UI/Title',
  component: Title,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Title>;

export const Default: Story = {
  args: {
    children: 'Hello World',
  },
};

export const CustomClass: Story = {
  args: {
    children: 'Custom Colored Title',
    className: 'text-red-500',
  },
};
