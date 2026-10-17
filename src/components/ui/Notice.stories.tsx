import type { Meta, StoryObj } from "@storybook/react";
import Notice from "./Notice";

const meta = {
  title: "UI/Notice",
  component: Notice,
  tags: ["autodocs"],
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  args: { children: "" },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text space-y-3 max-w-xl">
      <Notice tone="danger">Le VPN du panel n’est pas configuré : impossible d’ajouter un serveur pour le moment.</Notice>
      <Notice tone="warning" title="Attention">Certaines informations n’ont pas pu être chargées.</Notice>
      <Notice tone="success">Les modifications ont été enregistrées.</Notice>
      <Notice tone="info">Le déploiement démarre dans quelques secondes.</Notice>
      <Notice tone="danger" action={<button className="underline">Réessayer</button>}>Impossible de charger les données.</Notice>
      <Notice tone="warning" dense>Version serrée, pour une ligne d’avertissement discrète.</Notice>
    </div>
  ),
};
