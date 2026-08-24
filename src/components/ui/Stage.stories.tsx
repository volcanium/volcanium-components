import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Stage from "./Stage";

const meta = {
  title: "UI/Stage",
  component: Stage,
  tags: ["autodocs"],
} satisfies Meta<typeof Stage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="p-10 bg-back min-h-[50vh]">
      <div className="max-w-xl mx-auto mt-10">
        <Stage {...args} />
      </div>
    </div>
  ),
  args: {
    count: 1,
    title: "Une étape unique",
    children: "Voici à quoi ressemble le composant Stage utilisé de manière isolée. Il est conçu pour être mis en valeur dans un Cursus mais peut être utilisé séparément.",
  },
};

export const CustomClass: Story = {
  render: (args) => (
    <div className="p-10 bg-back min-h-[50vh]">
      <div className="max-w-xl mx-auto mt-10">
        <Stage {...args} />
      </div>
    </div>
  ),
  args: {
    count: 2,
    title: "Étape Personnalisée",
    children: "Cette étape utilise la propriété className pour modifier sa couleur de fond et ajouter une bordure.",
    className: "bg-main/10 border-2 border-main",
  },
};

export const Done: Story = {
  render: (args) => (
    <div className="p-10 bg-back min-h-[50vh]">
      <div className="max-w-xl mx-auto mt-10">
        <Stage {...args} />
      </div>
    </div>
  ),
  args: {
    count: 3,
    title: "Étape Terminée",
    children: "Cette étape est marquée comme terminée (done={true}). Le numéro est remplacé par une icône de validation et le style s'adapte.",
    done: true,
  },
};
