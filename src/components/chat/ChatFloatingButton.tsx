'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatDialog } from './ChatDialog'
import { MessageCircle } from 'lucide-react'

export function ChatFloatingButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
