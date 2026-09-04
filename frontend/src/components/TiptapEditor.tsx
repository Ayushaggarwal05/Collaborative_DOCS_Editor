import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { EditorToolbar } from './EditorToolbar';
import { Eye } from 'lucide-react';

interface TiptapEditorProps {
  initialContent: any;
  onChange: (content: any) => void;
  isReadOnly?: boolean;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialContent,
  onChange,
  isReadOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
    ],
    content: initialContent || { type: 'doc', content: [] },
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Keep editable state synchronized
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [isReadOnly, editor]);

  // Update content if initialContent changes externally (e.g. initial load)
  useEffect(() => {
    if (editor && initialContent) {
      const currentJson = JSON.stringify(editor.getJSON());
      const incomingJson = typeof initialContent === 'string'
        ? initialContent
        : JSON.stringify(initialContent);

      if (currentJson !== incomingJson && !editor.isFocused) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  return (
    <div className="flex flex-col flex-1 min-h-screen" style={{ background: 'linear-gradient(145deg, #eff6ff 0%, #f8faff 55%, #eef2ff 100%)' }}>
      {/* Toolbar */}
      <EditorToolbar editor={editor} isReadOnly={isReadOnly} />

      {/* Read-Only Notice Banner */}
      {isReadOnly && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-center space-x-2">
          <Eye className="w-4 h-4 text-amber-600" />
          <span>You have <strong>Viewer access</strong> to this document. Editing is disabled.</span>
        </div>
      )}

      {/* Document Workspace Canvas */}
      <div className="flex-1 py-10 px-4 sm:px-6 flex justify-center overflow-y-auto">
        <div
          className="w-full max-w-3xl bg-white min-h-[800px] p-10 sm:p-14 rounded-2xl transition-shadow"
          style={{
            boxShadow: '0 8px 48px rgba(15,23,42,0.10), 0 2px 8px rgba(59,130,246,0.06)',
            border: '1px solid rgba(226,232,240,0.8)',
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
