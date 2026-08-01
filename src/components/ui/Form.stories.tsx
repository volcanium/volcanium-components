import type { Meta, StoryObj } from '@storybook/react';
import Form from './Form';
import Button from './Button';
import { Contaner } from './Contaner';

const meta: Meta<typeof Form> = {
  title: 'UI/Form',
  component: Form,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Contaner title="Authentication" fix>
        <Story />
      </Contaner>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  args: {
    fields: [
      { name: 'username', label: 'Username', placeholder: 'Enter username' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' },
    ],
    btn: <Button type="submit">Submit</Button>,
    onSubmit: (values) => console.log('Form submitted:', values),
  },
};
