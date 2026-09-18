import type { Meta, StoryObj } from '@storybook/react';
import CheckListItem from './CheckListItem';

const meta: Meta<typeof CheckListItem> = {
  title: 'UI/CheckListItem',
  component: CheckListItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CheckListItem>;

export const Default: Story = {
  args: {
    children: 'This is a checked list item',
  },
};
