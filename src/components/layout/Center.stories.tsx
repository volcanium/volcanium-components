import type { Meta, StoryObj } from '@storybook/react';
import Center from './Center';
import Button from '../ui/Button';

const meta: Meta<typeof Center> = {
  title: 'Layout/Center',
  component: Center,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Center>;

export const Default: Story = {
  args: {
    children: <Button>Centered Content</Button>,
  },
};

export const FullHeight: Story = {
  args: {
    className: 'h-64 bg-gray-100',
    children: <Button>Centered in h-64</Button>,
  },
};
