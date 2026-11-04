import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FilePreviewStrip from "./FilePreviewStrip";

const meta = { title: "UI/FilePreviewStrip", component: FilePreviewStrip, tags: ["autodocs"] } satisfies Meta<typeof FilePreviewStrip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { files: [] },
  render: () => {
    const [files, setFiles] = useState<File[]>(() => [
      new File(["<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='#b8442a'/></svg>"], "visuel.svg", { type: "image/svg+xml" }),
      new File(["Notes de la réunion"], "notes.txt", { type: "text/plain" }),
      new File([new Uint8Array(4096)], "archive.zip", { type: "application/zip" }),
    ]);
    return (
      <div className="min-h-screen bg-vc-back p-10 text-vc-text">
        <FilePreviewStrip files={files} onRemove={(_, i) => setFiles((l) => l.filter((_, j) => j !== i))} />
      </div>
    );
  },
};
