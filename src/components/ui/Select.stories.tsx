import type { Meta, StoryObj } from '@storybook/react';
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
    placeholder: { control: 'text' },
  },
  parameters: {
    // Add layout parameter to center the select in the canvas, 
    // making it easier to see dropdown positioning
    layout: 'centered',
  }
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    placeholder: 'Select an option',
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ],
  },
};

export const WithSelectedValue: Story = {
  args: {
    placeholder: 'Select an option',
    value: 'opt2',
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ],
  },
};
