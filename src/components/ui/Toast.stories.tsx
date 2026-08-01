import type { Meta, StoryObj } from '@storybook/react';
import ToastProvider from './Toast';
import { notify } from './notify';
import Button from './Button'; // Assuming you have this or standard HTML button

const meta: Meta<typeof ToastProvider> = {
  title: 'UI/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const Interactive: Story = {
  render: () => (
    <ToastProvider>
      <div className="p-10 flex gap-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => notify('Info message', 'info')}
        >
          Show Info
        </button>
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => notify('Success message!', 'success')}
        >
          Show Success
        </button>
        <button 
          className="px-4 py-2 bg-yellow-500 text-white rounded"
          onClick={() => notify('Warning message', 'warn')}
        >
          Show Warning
        </button>
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => notify('Error message!', 'error')}
        >
          Show Error
        </button>
      </div>
    </ToastProvider>
  ),
};
