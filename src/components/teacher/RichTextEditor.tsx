'use client'

import { useCallback, useRef } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-text-style'
import { useUpload } from '@/hooks/useUpload'
import {
  Bold, Italic, Underline as UnderlineIcon, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight,
  Highlighter, Link2, ImageIcon, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content?: string
  placeholder?: string
  onChange?: (html: string) => void
  className?: string
  minHeight?: number
}

// --- Toolbar Button ---
function ToolBtn({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed',
        active && 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700'
      )}
    >
      {children}
    </button>
  )
}

// --- Divider ---
function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />
}

// --- Main Toolbar ---
function Toolbar({ editor }: { editor: Editor }) {
  const { upload } = useUpload()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const url = await upload(file, 'images')
        editor.chain().focus().setImage({ src: url, alt: file.name }).run()
      } catch (err) {
        console.error('[IMAGE_UPLOAD_FAIL]', err)
        alert('Upload ảnh thất bại. Vui lòng kiểm tra cấu hình R2.')
      }
    },
    [editor, upload]
  )

  const setLink = useCallback(() => {
    const prev = editor.getAttributes('link').href as string
    const url = window.prompt('Nhập URL:', prev)
    if (url === null) return // Bấm Cancel
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-200 bg-slate-50/80 rounded-t-[1.25rem]">
      {/* History */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
        <Undo size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
        <Redo size={15} />
      </ToolBtn>

      <Divider />

      {/* Headings */}
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Tiêu đề 1">
        <Heading1 size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tiêu đề 2">
        <Heading2 size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tiêu đề 3">
        <Heading3 size={15} />
      </ToolBtn>

      <Divider />

      {/* Inline formatting */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm (Ctrl+B)">
        <Bold size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
        <Italic size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
        <UnderlineIcon size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight từ vựng">
        <Highlighter size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
        <Code size={15} />
      </ToolBtn>

      <Divider />

      {/* Alignment */}
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
        <AlignLeft size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
        <AlignCenter size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
        <AlignRight size={15} />
      </ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách gạch đầu dòng">
        <List size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách đánh số">
        <ListOrdered size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
        <Quote size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
        <Minus size={15} />
      </ToolBtn>

      <Divider />

      {/* Link & Image */}
      <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Chèn/Sửa link">
        <Link2 size={15} />
      </ToolBtn>

      <ToolBtn onClick={() => imageInputRef.current?.click()} title="Chèn ảnh (upload lên R2)">
        <ImageIcon size={15} />
      </ToolBtn>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  )
}

// --- Main Component ---
export default function RichTextEditor({
  content = '',
  placeholder = 'Bắt đầu soạn thảo nội dung bài học...',
  onChange,
  className,
  minHeight = 300,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // Tránh SSR hydration mismatch
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ allowBase64: false, inline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate max-w-none focus:outline-none px-6 py-4',
          'prose-headings:font-bold prose-headings:text-slate-800',
          'prose-p:text-slate-700 prose-p:leading-relaxed',
          'prose-a:text-blue-600 prose-a:underline',
          'prose-blockquote:border-l-blue-400 prose-blockquote:text-slate-500',
          'prose-code:bg-slate-100 prose-code:rounded prose-code:px-1 prose-code:text-blue-700',
          'prose-img:rounded-2xl prose-img:shadow-md prose-img:max-w-full',
          'prose-mark:bg-yellow-200 prose-mark:rounded prose-mark:px-0.5'
        ),
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) {
    return (
      <div className={cn('border border-slate-200 rounded-[1.25rem] bg-white flex items-center justify-center', className)} style={{ minHeight }}>
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    )
  }

  return (
    <div className={cn('border border-slate-200 rounded-[1.25rem] bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-300 transition-all', className)}>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="overflow-auto"
      />
    </div>
  )
}
