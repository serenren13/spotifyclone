import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function RichTextEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit],
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

    if (!editor) return null;

    return (
        <div className="w-full bg-[var(--bg-primary)] border border-[var(--accent-secondary)]/30 rounded-xl mb-3 overflow-hidden">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 border-b border-[var(--accent-secondary)]/20">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 rounded text-sm font-bold ${editor.isActive('bold') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    B
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 rounded text-sm italic ${editor.isActive('italic') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    I
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`px-2 py-1 rounded text-sm line-through ${editor.isActive('strike') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    S
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    • List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('heading') ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-dark)]'}`}
                >
                    H2
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}