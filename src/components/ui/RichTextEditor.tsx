import { ReactNode, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconUnderline,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useLanguage } from "../../utils/useLanguage";
import IconButton from "./IconButton";
import { PromptModal } from "./ConfirmModal";

export interface RichTextEditorProps {
  /** HTML édité. Le composant n'assainit rien : l'HTML reçu d'un utilisateur doit l'être côté serveur. */
  value: string;
  /** Appelé à chaque modification avec l'HTML (chaîne vide si le texte est vide). */
  onChange: (html: string) => void;
  /** Nom accessible de la zone de saisie. */
  label?: string;
  /** Hauteur minimale de la zone de saisie. @default "10rem" */
  minHeight?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Éditeur de texte riche (gras, italique, souligné, listes, lien, annuler/rétablir), basé sur Tiptap.
 * Disponible via `@volcanium/volcanium-components/rich-text` (Tiptap n'alourdit pas le reste de la bibliothèque).
 */
export default function RichTextEditor({
  value,
  onChange,
  label,
  minHeight = "10rem",
  disabled = false,
  className,
}: RichTextEditorProps) {
  const { t } = useLanguage();
  const [linkOpen, setLinkOpen] = useState(false);
  const emitted = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } },
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        ...(label ? { "aria-label": label } : {}),
        class:
          "p-3 text-sm text-vc-text outline-none [&_a]:text-vc-main [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
        style: `min-height:${minHeight}`,
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? "" : e.getHTML();
      emitted.current = html;
      onChange(html);
    },
  });

  // Une valeur changée de l'extérieur remplace le contenu ; ce que l'éditeur vient d'émettre ne le fait pas.
  useEffect(() => {
    if (editor && value !== emitted.current) {
      emitted.current = value;
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const tool = (name: string, active: boolean, run: () => void, icon: ReactNode, off = false) => (
    <IconButton
      label={name}
      onClick={run}
      disabled={disabled || off}
      className={active ? "bg-vc-veil-strong" : ""}
      aria-pressed={active}
    >
      {icon}
    </IconButton>
  );

  return (
    <div className={clsx("w-full rounded-lg border border-vc-line-strong bg-vc-container", className)}>
      <div role="toolbar" aria-label={t("rte_toolbar")} className="flex flex-wrap items-center gap-0.5 border-b border-vc-line p-1">
        {tool(t("rte_bold"), !!editor?.isActive("bold"), () => editor?.chain().focus().toggleBold().run(), <IconBold size={16} />)}
        {tool(t("rte_italic"), !!editor?.isActive("italic"), () => editor?.chain().focus().toggleItalic().run(), <IconItalic size={16} />)}
        {tool(t("rte_underline"), !!editor?.isActive("underline"), () => editor?.chain().focus().toggleUnderline().run(), <IconUnderline size={16} />)}
        {tool(t("rte_bullet_list"), !!editor?.isActive("bulletList"), () => editor?.chain().focus().toggleBulletList().run(), <IconList size={16} />)}
        {tool(t("rte_ordered_list"), !!editor?.isActive("orderedList"), () => editor?.chain().focus().toggleOrderedList().run(), <IconListNumbers size={16} />)}
        {tool(t("rte_link"), !!editor?.isActive("link"), () => setLinkOpen(true), <IconLink size={16} />)}
        {tool(t("rte_undo"), false, () => editor?.chain().focus().undo().run(), <IconArrowBackUp size={16} />, !editor?.can().undo())}
        {tool(t("rte_redo"), false, () => editor?.chain().focus().redo().run(), <IconArrowForwardUp size={16} />, !editor?.can().redo())}
      </div>
      <EditorContent editor={editor} />
      <PromptModal
        isOpen={linkOpen}
        onClose={() => setLinkOpen(false)}
        title={t("rte_link")}
        label={t("rte_link_label")}
        placeholder={t("rte_link_placeholder")}
        initialValue={(editor?.getAttributes("link").href as string | undefined) ?? ""}
        confirmLabel={t("rte_link")}
        onSubmit={(v) => {
          if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) editor?.chain().focus().extendMarkRange("link").setLink({ href: v }).run();
        }}
      />
    </div>
  );
}
