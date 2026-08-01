import type { Meta, StoryObj } from '@storybook/react';
import LiCheck from './LiCheck';

const meta: Meta<typeof LiCheck> = {
  title: 'UI/LiCheck',
  component: LiCheck,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LiCheck>;

export const Default: Story = {
  args: {
    children: 'This is a checked list item',
  },
};
