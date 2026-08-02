import type { Meta, StoryObj } from "@storybook/react";
import Modal from "./Modal";

import { useState, useEffect } from "react";
import Button from "./Button";
import Center from "./../layout/Center";

const meta = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: {
        inline: false,
        iframeHeight: 600,
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalWithState = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);

  useEffect(() => {
    setIsOpen(args.isOpen);
  }, [args.isOpen]);

  return (
    <div>
      <Center className="h-screen">
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      </Center>
      <Modal
        {...args}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          args.onClose?.();
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    isOpen: true,
    title: "Example Modal",
    children: <div>This is the modal content.</div>,
    onClose: () => {},
  },
};

export const WithoutButtons: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    isOpen: true,
    title: "Info Modal",
    buttons: false,
    children: <div>This modal has no default buttons.</div>,
    onClose: () => {},
  },
};
