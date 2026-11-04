import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconUpload } from "@tabler/icons-react";
import FilePicker from "./FilePicker";

const meta = {
  title: "UI/FilePicker",
  component: FilePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof FilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Déployer un zip", onPick: () => undefined },
  render: () => (
    <div className="p-10 bg-vc-back min-h-screen text-vc-text">
      <FilePicker icon={<IconUpload size={18} />} accept=".zip" onPick={() => undefined}>Déployer un zip</FilePicker>
    </div>
  ),
};

/** Les fichiers choisis restent dans la liste de l'app (`onPick`) ; passés en `previewFiles`, ils s'affichent avec miniature, et un clic ouvre la visionneuse. */
export const WithPreview: Story = {
  args: { children: "Joindre des fichiers", onPick: () => undefined },
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="p-10 bg-vc-back min-h-screen text-vc-text">
        <FilePicker multiple icon={<IconUpload size={18} />} onPick={(f) => setFiles((l) => [...l, f])} previewFiles={files} onRemoveFile={(_, i) => setFiles((l) => l.filter((_, j) => j !== i))}>
          Joindre des fichiers
        </FilePicker>
      </div>
    );
  },
};
