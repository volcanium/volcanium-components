import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Hero from "./Hero";
import Title from "../ui/Title";
import Button from "../ui/Button";

const meta = {
  title: "Layout/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3272&auto=format&fit=crop",
    darkened: 60,
    children: (
      <div className="text-center text-white flex flex-col items-center gap-6">
        <Title className="text-5xl md:text-7xl font-title text-main">Volcanium UI</Title>
        <p className="text-xl md:text-2xl max-w-2xl opacity-90">
          The ultimate component library to build blazing fast interfaces.
        </p>
        <div className="flex gap-4 mt-4">
          <Button>Get Started</Button>
          <Button>Documentation</Button>
        </div>
      </div>
    ),
    bottom: (
      <div className="text-white/60 text-sm animate-bounce tracking-widest uppercase">
        Scroll to discover
      </div>
    ),
  },
};

export const NoOverlay: Story = {
  args: {
    img: "https://images.unsplash.com/photo-1506744626753-1400269f8a84?q=80&w=3140&auto=format&fit=crop",
    darkened: 0,
    children: (
      <div className="text-center text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
        <Title className="text-6xl font-bold">Clear Vision</Title>
      </div>
    ),
  },
};
