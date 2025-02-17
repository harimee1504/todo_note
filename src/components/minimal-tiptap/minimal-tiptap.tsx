import * as React from 'react'
import './styles/index.css'

import type { Content, Editor } from '@tiptap/react'
import type { UseMinimalTiptapEditorProps } from './hooks/use-minimal-tiptap'
import { EditorContent } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SectionOne } from './components/section/one'
import { SectionTwo } from './components/section/two'
import { SectionThree } from './components/section/three'
import { SectionFour } from './components/section/four'
import { SectionFive } from './components/section/five'
import { LinkBubbleMenu } from './components/bubble-menu/link-bubble-menu'
import { useMinimalTiptapEditor } from './hooks/use-minimal-tiptap'
import { MeasuredContainer } from './components/measured-container'

export interface MinimalTiptapProps extends Omit<UseMinimalTiptapEditorProps, 'onUpdate'> {
  value?: Content
  onChange?: (value: Content) => void
  className?: string
  editorContentClassName?: string
  toolbarType?: 'basic' | 'intermediate' | 'advanced'
  toolBar: boolean
  canMention?: boolean
}

interface ToolbarProps {
  editor: Editor
  toolbarType?: 'basic' | 'intermediate' | 'advanced'
}

const Toolbar = ({ editor, toolbarType }: ToolbarProps) => {
  const toolbarOptions = {
    basic: {
      section1: {},
      section2: {
        activeActions: ['underline', 'bold', 'italic', 'strikethrough', 'code', 'clearFormatting'],
        mainActionCount: 1,
      },
      section4: {
        activeActions: ['orderedList', 'bulletList'],
        mainActionCount: 0,
      },
      section5: {
        activeActions: ['link', 'image', 'codeBlock', 'blockquote', 'horizontalRule'],
        mainActionCount: 0,
      }
    },
    intermediate: {
      section1: {
        activeLevels : [1, 2, 3, 4, 5, 6],
      },
      section2: {
        activeActions: ['bold', 'italic', 'underline', 'strikethrough', 'code', 'clearFormatting'],
        mainActionCount: 3,
      },
      section4: {
        activeActions: ['orderedList', 'bulletList'],
        mainActionCount: 0,
      },
      section5: {
        activeActions: ['codeBlock', 'blockquote', 'horizontalRule'],
        mainActionCount: 0,
      }
    },
    advanced: {
      section1: {
        activeLevels : [1, 2, 3, 4, 5, 6],
      },
      section2: {
        activeActions: ['bold', 'italic', 'underline', 'strikethrough', 'code', 'clearFormatting'],
        mainActionCount: 3,
      },
      section4: {
        activeActions: ['orderedList', 'bulletList'],
        mainActionCount: 0,
      },
      section5: {
        activeActions: ['codeBlock', 'blockquote', 'horizontalRule'],
        mainActionCount: 0,
      }
    },

  }
  return (
    <div className="shrink-0 overflow-x-auto border-b border-border p-2">
      <div className="flex w-max items-center gap-px">
        {toolbarOptions[toolbarType].section1.activeLevels && <>
          <SectionOne editor={editor} activeLevels={toolbarOptions[toolbarType].section1.activeLevels} />
          <Separator orientation="vertical" className="mx-2 h-7" />
        </>
        }
  
        <SectionTwo
          editor={editor}
          activeActions={toolbarOptions[toolbarType].section2.activeActions}
          mainActionCount={toolbarOptions[toolbarType].section2.mainActionCount}
        />
  
        <Separator orientation="vertical" className="mx-2 h-7" />
  
        <SectionThree editor={editor} />
  
        <Separator orientation="vertical" className="mx-2 h-7" />
  
        <SectionFour editor={editor} activeActions={toolbarOptions[toolbarType].section4.activeActions} mainActionCount={toolbarOptions[toolbarType].section4.mainActionCount} />
  
        <Separator orientation="vertical" className="mx-2 h-7" />
  
        <SectionFive editor={editor} activeActions={toolbarOptions[toolbarType].section5.activeActions} mainActionCount={toolbarOptions[toolbarType].section5.mainActionCount} />
      </div>
    </div>
  )
}

export const MinimalTiptapEditor = React.forwardRef<HTMLDivElement, MinimalTiptapProps>(
  ({ value, onChange, className, editorContentClassName, toolbarType, toolBar, canMention = true, ...props }, ref) => {
    const editor = useMinimalTiptapEditor({
      value,
      canMention,
      onUpdate: onChange,
      ...props
    })

    if (!editor) {
      return null
    }

    return (
      <MeasuredContainer
        as="div"
        name="editor"
        ref={ref}
        className={cn(
          'flex h-auto min-h-16 w-full flex-col rounded-md border border-input shadow-sm focus-within:border-primary',
          className
        )}
      >
        {toolBar && <Toolbar editor={editor} toolbarType={toolbarType} />}
        <EditorContent editor={editor} className={cn('minimal-tiptap-editor', editorContentClassName)} />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    )
  }
)

MinimalTiptapEditor.displayName = 'MinimalTiptapEditor'

export default MinimalTiptapEditor
