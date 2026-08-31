import type { Meta, StoryObj } from '@storybook/react';
import SearchSelect from './SearchSelect';
import { Contaner } from './Contaner';

const CITIES = [
  'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier',
  'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Saint-Étienne',
  'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
].map((name) => ({ label: name, value: name }));

const meta: Meta<typeof SearchSelect> = {
  title: 'UI/SearchSelect',
  component: SearchSelect,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
    onSearchChange: { action: 'searched' },
    placeholder: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    loading: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['default', 'one', 'secondary'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '340px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '2rem', width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchSelect>;

export const Default: Story = {
  args: {
    placeholder: 'Choisir une ville',
    options: CITIES,
  },
};

export const WithSelectedValue: Story = {
  args: {
    placeholder: 'Choisir une ville',
    value: 'Lyon',
    options: CITIES,
  },
};

export const InputVariantOne: Story = {
  args: {
    variant: 'one',
    placeholder: 'Choisir une ville',
    label: 'Gare de départ',
    options: CITIES,
  },
  decorators: [
    (Story) => (
      <Contaner title="Recherche d'une grande liste">
        <Story />
      </Contaner>
    ),
  ],
};

export const Loading: Story = {
  args: {
    variant: 'one',
    placeholder: 'Choisir une ville',
    label: 'Résultats côté serveur',
    loading: true,
    options: [],
  },
  decorators: [
    (Story) => (
      <Contaner title="Recherche server-side (onSearchChange)">
        <Story />
      </Contaner>
    ),
  ],
};
