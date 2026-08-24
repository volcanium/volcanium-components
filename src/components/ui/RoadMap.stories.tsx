import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import RoadMap from "./RoadMap";

const meta = {
  title: "UI/RoadMap",
  component: RoadMap,
  tags: ["autodocs"],
} satisfies Meta<typeof RoadMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="p-10 bg-back min-h-screen">
      <RoadMap {...args} />
    </div>
  ),
  args: {
    stages: [
      {
        title: "Planification",
        content: "Planifier le concept, choisir les plugins et préparer l'architecture.",
        sideContent: (
          <div className="bg-contaner p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">📅</span>
          </div>
        ),
      },
      {
        title: "Design",
        content: "Création des maquettes, wireframes et validation du parcours utilisateur avec le client.",
        sideContent: (
          <div className="bg-contaner p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">🎨</span>
          </div>
        ),
      },
      {
        title: "Développement",
        content: "Intégration du code frontend et backend avec des technologies modernes et robustes.",
        sideContent: (
          <div className="bg-contaner p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">💻</span>
          </div>
        ),
      },
      {
        title: "Lancement",
        content: "Déploiement en production, optimisation des performances et vérification du référencement (SEO).",
        sideContent: (
          <div className="bg-contaner p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">🚀</span>
          </div>
        ),
      },
    ],
  },
};
