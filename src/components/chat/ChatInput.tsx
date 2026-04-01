'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface ChatInputProps {
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
}

export function ChatInput({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-muted/30">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的问题..."
        disabled={isLoading}
        className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        rows={1}
        style={{ maxHeight: '120px' }}
      />
      <Button
        onClick={onSubmit}
        disabled={!input.trim() || isLoading}
        size="icon"
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
