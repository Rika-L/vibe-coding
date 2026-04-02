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

  // 打开时：有历史对话则不自动创建，只在没有对话时创建新对话
  useEffect(() => {
    if (open && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // 先检查是否有历史对话
      fetch('/api/conversations')
        .then(res => res.json())
        .then((data) => {
          if (data.conversations?.length === 0) {
            // 没有历史对话，自动创建
            handleNewConversation();
          }
          // 有历史对话则不自动创建，显示列表让用户选择
        })
        .catch(() => {
          // 出错时静默处理，不阻断用户
        });
    }
  }, [open, handleNewConversation]);

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
            <ChatMessages messages={messages} isLoading={isLoading} />
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
