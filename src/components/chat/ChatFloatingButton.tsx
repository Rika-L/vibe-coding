'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChatDialog } from './ChatDialog';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ChatFloatingButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
