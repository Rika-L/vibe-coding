'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConversationList } from './ConversationList';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { toast } from 'sonner';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [input, setInput] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // 加载对话历史
  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok)
        throw new Error('加载对话失败');
      const data = await res.json();
      setMessages(data.conversation.messages.map((m: { id: string; role: string; content: string }) => ({
        id: m.id || crypto.randomUUID(),
        role: m.role as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: m.content }],
      })));
      setConversationId(id);
    }
    catch (error) {
      console.error('Load conversation error:', error);
      toast.error('加载对话失败');
    }
  }, [setMessages]);

  // 创建新对话
  const handleNewConversation = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新对话' }),
      });
      if (!res.ok)
        throw new Error('创建对话失败');
      const data = await res.json();
      setConversationId(data.conversation.id);
      setMessages([]);
      setRefreshTrigger(Date.now());
    }
    catch (error) {
      console.error('Create conversation error:', error);
      toast.error('创建对话失败');
    }
  }, [setMessages]);

  // 打开时：有历史对话则选中最新的一条，没有则自动创建新对话
  useEffect(() => {
    if (open && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // 先检查登录状态
      fetch('/api/auth/me')
        .then((res) => {
          if (!res.ok) {
            throw new Error('未登录');
          }
          return res.json();
        })
        .then(() => {
          // 已登录，加载用户头像
          fetch('/api/user/profile')
            .then(res => res.ok ? res.json() : null)
            .then((data) => {
              if (data?.user?.avatar) {
                setUserAvatar(data.user.avatar);
              }
            })
            .catch(() => {});
          // 检查是否有历史对话
          fetch('/api/conversations')
            .then(res => res.json())
            .then((data) => {
              if (data.conversations?.length > 0) {
                // 有历史对话，选中最新的一条（按 updatedAt 排序后的第一条）
                const latestConversation = data.conversations[0];
                loadConversation(latestConversation.id);
              }
              else {
                // 没有历史对话，自动创建
                handleNewConversation();
              }
            })
            .catch(() => {
              // 出错时静默处理，不阻断用户
            });
        })
        .catch(() => {
          // 未登录，不创建对话
          toast.error('请先登录');
        });
    }
  }, [open, handleNewConversation, loadConversation]);

  const onSubmit = () => {
    if (!conversationId) {
      toast.error('请先创建对话');
      return;
    }
    if (!input.trim())
      return;

    sendMessage(
      { text: input },
      {
        body: { conversationId },
      },
    );
    setInput('');
  };

  // 监听消息变化以触发刷新
  useEffect(() => {
    if (messages.length > 0) {
      setRefreshTrigger(Date.now());
    }
  }, [messages.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] h-[600px] p-0 flex flex-col sm:max-w-4xl">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg">睡眠专家 AI</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex overflow-hidden">
          <ConversationList
            selectedId={conversationId}
            onSelect={loadConversation}
            onNew={handleNewConversation}
            refreshTrigger={refreshTrigger}
          />
          <div className="flex-1 flex flex-col">
            <ChatMessages messages={messages} status={status} userAvatar={userAvatar} />
            <ChatInput
              input={input}
              isLoading={isLoading}
              onInputChange={setInput}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
