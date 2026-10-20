import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

const meta: Meta<typeof RichTextEditor> = {
  title: "UI/RichTextEditor",
  component: RichTextEditor,
};
export default meta;

export const Default: StoryObj<typeof RichTextEditor> = {
  render: () => {
    const [value, setValue] = useState("<p>Passionné de <strong>cuisine</strong> et de randonnée.</p>");
    return (
      <div className="max-w-2xl">
        <RichTextEditor label="Bio" value={value} onChange={setValue} />
      </div>
    );
  },
};
