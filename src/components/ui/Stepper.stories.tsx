import type { Meta, StoryObj } from "@storybook/react";
import Stepper from "./Stepper";

const meta = {
  title: "UI/Stepper",
  component: Stepper,
  tags: ["autodocs"],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Linear: Story = {
  render: (args) => (
    <div className="p-10 bg-vc-back min-h-screen">
      <Stepper {...args} />
    </div>
  ),
  args: {
    layout: "linear",
    stages: [
      {
        title: "Initialisation",
        content:
          "Nous définissons ensemble vos besoins, vos objectifs et votre public cible pour poser des fondations solides.",
        done: true,
      },
      {
        title: "Conception",
        content:
          "Création des maquettes, choix de l'identité visuelle et validation des parcours utilisateurs (UX/UI).",
      },
      {
        title: "Développement",
        content:
          "Nous codons votre application avec des technologies de pointe, en garantissant performance et scalabilité.",
      },
      {
        title: "Lancement",
        content:
          "Déploiement sur les serveurs de production, optimisations SEO et suivi post-lancement pour un succès garanti.",
      },
    ],
  },
};

export const Zigzag: Story = {
  render: (args) => (
    <div className="p-10 bg-vc-back min-h-screen">
      <Stepper {...args} />
    </div>
  ),
  args: {
    layout: "zigzag",
    stages: [
      {
        title: "Planification",
        content: "Planifier le concept, choisir les plugins et préparer l'architecture.",
        done: true,
        sideContent: (
          <div className="bg-vc-container p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">📅</span>
          </div>
        ),
      },
      {
        title: "Design",
        content: "Création des maquettes, wireframes et validation du parcours utilisateur avec le client.",
        sideContent: (
          <div className="bg-vc-container p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">🎨</span>
          </div>
        ),
      },
      {
        title: "Développement",
        content: "Intégration du code frontend et backend avec des technologies modernes et robustes.",
        sideContent: (
          <div className="bg-vc-container p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">💻</span>
          </div>
        ),
      },
      {
        title: "Lancement",
        content: "Déploiement en production, optimisation des performances et vérification du référencement (SEO).",
        sideContent: (
          <div className="bg-vc-container p-4 rounded-xl flex items-center justify-center aspect-square max-w-[150px] border border-white/5 shadow-xl">
            <span className="text-4xl">🚀</span>
          </div>
        ),
      },
    ],
  },
};
