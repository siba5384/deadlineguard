import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect } from 'react'

export default function BlockEditor({ initialContent, onChange }: { initialContent: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type '/' for commands or just start typing notes..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[150px] cursor-text text-sm text-text-primary leading-relaxed'
      }
    }
  })

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      if (!editor.isFocused) {
        editor.commands.setContent(initialContent)
      }
    }
  }, [initialContent, editor])

  return (
    <div className="bg-bg-base border border-border rounded-xl p-4 transition-colors focus-within:border-violet-500 min-h-[200px]">
       <EditorContent editor={editor} />
    </div>
  )
}
