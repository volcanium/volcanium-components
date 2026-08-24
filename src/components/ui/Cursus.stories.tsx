import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Cursus from "./Cursus";

const meta = {
  title: "UI/Cursus",
  component: Cursus,
  tags: ["autodocs"],
} satisfies Meta<typeof Cursus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="p-10 bg-back min-h-screen">
      <Cursus {...args} />
    </div>
  ),
  args: {
    stages: [
      {
        title: "Initialisation",
        content: "Nous définissons ensemble vos besoins, vos objectifs et votre public cible pour poser des fondations solides.",
      },
      {
        title: "Conception",
        content: "Création des maquettes, choix de l'identité visuelle et validation des parcours utilisateurs (UX/UI).",
      },
      {
        title: "Développement",
        content: "Nous codons votre application avec des technologies de pointe, en garantissant performance et scalabilité.",
      },
      {
        title: "Lancement",
        content: "Déploiement sur les serveurs de production, optimisations SEO et suivi post-lancement pour un succès garanti.",
      },
    ],
  },
};
