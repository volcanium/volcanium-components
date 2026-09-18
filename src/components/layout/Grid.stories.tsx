import type { Meta, StoryObj } from '@storybook/react';
import Grid from './Grid';
import { Container } from '../ui/Container';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  args: {
    min: 200,
    children: (
      <>
        <Container title="Widget 1"><p>Content 1</p></Container>
        <Container title="Widget 2"><p>Content 2</p></Container>
        <Container title="Widget 3"><p>Content 3</p></Container>
        <Container title="Widget 4"><p>Content 4</p></Container>
        <Container title="Widget 5"><p>Content 5</p></Container>
      </>
    ),
  },
};
