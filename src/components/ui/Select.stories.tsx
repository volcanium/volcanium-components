import type { Meta, StoryObj } from '@storybook/react';
import Select from './Select';
import { Contaner } from './Contaner';

const OPTIONS = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
];

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
    placeholder: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'one', 'secondary'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '2rem', width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    placeholder: 'Select an option',
    options: OPTIONS,
  },
};

export const WithSelectedValue: Story = {
  args: {
    placeholder: 'Select an option',
    value: 'opt2',
    options: OPTIONS,
  },
};

export const InputVariantOne: Story = {
  args: {
    variant: 'one',
    placeholder: 'Select an option',
    label: 'Category',
    options: OPTIONS,
  },
  decorators: [
    (Story) => (
      <Contaner title="Input variant — one">
        <Story />
      </Contaner>
    ),
  ],
};

export const InputVariantSecondary: Story = {
  args: {
    variant: 'secondary',
    placeholder: 'Select an option',
    label: 'Category',
    options: OPTIONS,
  },
  decorators: [
    (Story) => (
      <Contaner title="Input variant — secondary">
        <Story />
      </Contaner>
    ),
  ],
};
