import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  isReadOnly?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, isReadOnly = false }) => {
  if (!editor) {
    return null;
  }

  const btnClass = (isActive: boolean) =>
    `p-2 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center ${
      isActive
        ? 'text-white shadow-md'
        : 'text-slate-500 hover:text-slate-900 hover:bg-blue-50'
    } disabled:opacity-25 disabled:pointer-events-none`;

  const activeStyle = { background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' };

  return (
    <div
      className="px-4 py-2 flex flex-wrap items-center gap-1 sticky top-16 z-20"
      style={{
        background: 'linear-gradient(135deg, #f8faff, #f0f6ff)',
        borderBottom: '1.5px solid rgba(147,197,253,0.5)',
        boxShadow: '0 2px 12px rgba(59,130,246,0.06)',
      }}
    >
      {/* History (Undo / Redo) */}
      <div className="flex items-center space-x-0.5 pr-2 mr-1" style={{ borderRight: '1.5px solid rgba(147,197,253,0.5)' }}>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo() || isReadOnly} title="Undo (Ctrl+Z)" className={btnClass(false)}><Undo className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo() || isReadOnly} title="Redo (Ctrl+Y)" className={btnClass(false)}><Redo className="w-4 h-4" /></button>
      </div>

      {/* Headings Dropdown / Buttons */}
      <div className="flex items-center space-x-0.5 pr-2 mr-1" style={{ borderRight: '1.5px solid rgba(147,197,253,0.5)' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={isReadOnly}
          title="Heading 1"
          className={btnClass(editor.isActive('heading', { level: 1 }))}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={isReadOnly}
          title="Heading 2"
          className={btnClass(editor.isActive('heading', { level: 2 }))}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={isReadOnly}
          title="Heading 3"
          className={btnClass(editor.isActive('heading', { level: 3 }))}
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* Text Styles (Bold, Italic, Underline, Strike) */}
      <div className="flex items-center space-x-0.5 pr-2 mr-1" style={{ borderRight: '1.5px solid rgba(147,197,253,0.5)' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={isReadOnly}
          title="Bold (Ctrl+B)"
          className={btnClass(editor.isActive('bold'))}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={isReadOnly}
          title="Italic (Ctrl+I)"
          className={btnClass(editor.isActive('italic'))}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={isReadOnly}
          title="Underline (Ctrl+U)"
          className={btnClass(editor.isActive('underline'))}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={isReadOnly}
          title="Strikethrough"
          className={btnClass(editor.isActive('strike'))}
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Lists & Quotes */}
      <div className="flex items-center space-x-0.5 pr-2 mr-1" style={{ borderRight: '1.5px solid rgba(147,197,253,0.5)' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={isReadOnly}
          title="Bullet List (Ctrl+Shift+8)"
          className={btnClass(editor.isActive('bulletList'))}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={isReadOnly}
          title="Numbered List (Ctrl+Shift+7)"
          className={btnClass(editor.isActive('orderedList'))}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={isReadOnly}
          title="Quote"
          className={btnClass(editor.isActive('blockquote'))}
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      {/* Code & Horizontal Rule */}
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={isReadOnly}
          title="Inline Code"
          className={btnClass(editor.isActive('code'))}
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={isReadOnly}
          title="Divider Line"
          className={btnClass(false)}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {isReadOnly && (
        <span
          className="text-[11px] font-bold tracking-wide ml-auto px-3 py-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #fefce8, #fef3c7)', color: '#92400e', border: '1px solid #fcd34d' }}
        >
          👁 View Only
        </span>
      )}
    </div>
  );
};
