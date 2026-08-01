import type { Meta, StoryObj } from '@storybook/react';
import Table from './Table';


const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],

} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCols = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name', editable: true },
  { field: 'role', headerName: 'Role', editable: true },
];

export const Default: Story = {
  args: {
    title: 'Users Table',
    colsDefs: mockCols,
    fetchMethod: async () => [
      { id: 1, name: 'Alice', role: 'Admin' },
      { id: 2, name: 'Bob', role: 'User' },
    ],
  },
};

export const WithRowSelection: Story = {
  args: {
    ...Default.args,
    rowSelection: 'multiple',
    title: 'Selectable Table',
  },
};
