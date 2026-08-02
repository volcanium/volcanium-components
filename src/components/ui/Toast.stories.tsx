import type { Meta, StoryObj } from '@storybook/react';
import ToastProvider from './Toast';
import { notify } from './notify';
import Button from './Button';

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
      <div className="p-10 flex flex-wrap gap-4">
        <Button 
          variant="secondary"
          onClick={() => notify.info('Info message')}
        >
          Show Info
        </Button>
        <Button 
          variant="primary"
          onClick={() => notify.success('Success message!')}
        >
          Show Success
        </Button>
        <Button 
          variant="lum"
          onClick={() => notify.warn('Warning message')}
        >
          Show Warning
        </Button>
        <Button 
          variant="tertiary"
          onClick={() => notify.error('Error message!')}
        >
          Show Error
        </Button>
      </div>
    </ToastProvider>
  ),
};
