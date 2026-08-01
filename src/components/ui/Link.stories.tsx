import type { Meta, StoryObj } from '@storybook/react';
import Link from './Link';


const meta: Meta<typeof Link> = {
  title: 'UI/Link',
  component: Link,
  tags: ['autodocs'],

};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    children: 'Click me to navigate',
    link: '/some-page',
  },
};

export const ExternalOrNoLink: Story = {
  args: {
    children: 'Just an anchor without router link',
    href: 'https://example.com',
  },
};
