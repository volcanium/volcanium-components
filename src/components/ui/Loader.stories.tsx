import type { Meta, StoryObj } from '@storybook/react';
import Loader from './Loader';

const meta: Meta<typeof Loader> = {
  title: 'UI/Loader',
  component: Loader,
  tags: ['autodocs'],
  argTypes: {
    hide: { control: 'boolean' },
    full: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    hide: false,
    full: false,
  },
};

export const FullWidth: Story = {
  args: {
    hide: false,
    full: true,
  },
};

export const Hidden: Story = {
  args: {
    hide: true,
    full: false,
  },
};
