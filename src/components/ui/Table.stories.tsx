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

// In-story mock "backend" — a real app passes fetch/mutation calls to its own API layer here.
const mockUsers = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' },
];

export const Default: Story = {
  args: {
    title: 'Users Table',
    colsDefs: mockCols,
    fetchMethod: async () => mockUsers,
    modifMethod: (params) => {
      console.log('Cell edited', params.data);
    },
  },
};

export const WithRowSelection: Story = {
  args: {
    ...Default.args,
    rowSelection: { mode: 'multiRow' },
    title: 'Selectable Table',
  },
};

export const WithCrud: Story = {
  args: {
    ...Default.args,
    title: 'Users Table (add / delete)',
    deleteRow: true,
    deleteRequest: async (rows) => {
      console.log('Delete rows', rows);
    },
    newRow: {
      method: async (values, close) => {
        console.log('Create row', values);
        close();
      },
      modal: {
        title: 'Add a user',
        fields: [
          { name: 'name', label: 'Name' },
          { name: 'role', label: 'Role' },
        ],
      },
    },
  },
};
