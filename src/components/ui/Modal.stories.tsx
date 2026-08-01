import type { Meta, StoryObj } from '@storybook/react';
import Modal from './Modal';

import { useState } from 'react';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],

} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalWithState = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    isOpen: true,
    title: 'Example Modal',
    children: <div>This is the modal content.</div>,
    onClose: () => {},
  },
};

export const WithoutButtons: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    isOpen: true,
    title: 'Info Modal',
    buttons: false,
    children: <div>This modal has no default buttons.</div>,
    onClose: () => {},
  },
};
