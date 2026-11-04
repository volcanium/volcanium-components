import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FilePreviewModal from "./FilePreviewModal";
import Button from "./Button";
import type { FilePreviewItem } from "./filePreview";

const svg = (bg: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${bg}"/><text x="600" y="420" font-size="64" text-anchor="middle" fill="white" font-family="sans-serif">${label}</text></svg>`)}`;

const ITEMS: FilePreviewItem[] = [
  { url: svg("#b8442a", "Maquette 1"), name: "maquette-1.svg", mime: "image/svg+xml", size: 18_400 },
  { url: svg("#2a6fb8", "Maquette 2"), name: "maquette-2.svg", mime: "image/svg+xml", size: 21_900 },
  { url: "data:text/plain;charset=utf-8,Notes%20de%20la%20r%C3%A9union%0A-%20point%201%0A-%20point%202", name: "notes.txt", mime: "text/plain", size: 41 },
  { url: "data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==", name: "archive.zip", mime: "application/zip", size: 22 },
];

const meta = { title: "UI/FilePreviewModal", component: FilePreviewModal, tags: ["autodocs"] } satisfies Meta<typeof FilePreviewModal>;
export default meta;
type Story = StoryObj<typeof meta>;

/** ← → naviguent, Échap ferme. L'archive affiche l'écran « Pas d'aperçu » avec le bouton Télécharger. */
export const Galerie: Story = {
  args: { open: false, onClose: () => undefined, items: ITEMS },
  render: () => {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
      <div className="min-h-screen bg-vc-back p-10 text-vc-text">
        <Button onClick={() => setOpen(true)}>Ouvrir l'aperçu</Button>
        <FilePreviewModal open={open} onClose={() => setOpen(false)} items={ITEMS} index={index} onIndexChange={setIndex} />
      </div>
    );
  },
};

export const FichierUnique: Story = {
  args: { open: false, onClose: () => undefined, items: ITEMS.slice(0, 1) },
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-vc-back p-10 text-vc-text">
        <Button onClick={() => setOpen(true)}>Rouvrir</Button>
        <FilePreviewModal open={open} onClose={() => setOpen(false)} items={ITEMS.slice(0, 1)} />
      </div>
    );
  },
};
