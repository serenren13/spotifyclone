import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

export default function RichTextEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: "What's on your mind?",
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert min-h-[120px] p-3 focus:outline-none text-[var(--text-primary)]',
            },
        },
    });

    const editorState = useEditorState({
        editor,
        selector: (ctx) => ({
            isBold: ctx.editor?.isActive('bold'),
            isItalic: ctx.editor?.isActive('italic'),
            isUnderline: ctx.editor?.isActive('underline'),
            isStrike: ctx.editor?.isActive('strike'),
            isBulletList: ctx.editor?.isActive('bulletList'),
            isHeading: ctx.editor?.isActive('heading'),
        }),
    });

    if (!editor) return null;

    return (
        <div className="w-full bg-[var(--bg-primary)] border border-[var(--accent-secondary)]/30 rounded-xl mb-3 overflow-hidden">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 border-b border-[var(--accent-secondary)]/20">
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    className={`px-2 py-1 rounded text-sm font-bold ${editor.isActive('bold') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    B
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    className={`px-2 py-1 rounded text-sm italic ${editor.isActive('italic') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    I
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                    className={`px-2 py-1 rounded text-sm underline ${editor.isActive('underline') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    U
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
                    className={`px-2 py-1 rounded text-sm line-through ${editor.isActive('strike') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    S
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    • List
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('heading') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    H2
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}