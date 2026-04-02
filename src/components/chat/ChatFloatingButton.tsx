'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChatDialog } from './ChatDialog';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserInfo {
  name: string | null;
  avatar: string | null;
}

export function ChatFloatingButton() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 获取用户信息
    fetch('/api/user/profile')
      .then(res => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

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
        {user?.avatar ? (
          <span className="text-lg">{user.avatar}</span>
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
