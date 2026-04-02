'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import type { UIMessage } from 'ai';

interface ChatMessagesProps {
  messages: UIMessage[];
  status: 'streaming' | 'submitted' | 'ready' | 'error';
}

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && status !== 'submitted') {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>你好！我是睡眠专家 AI</p>
          <p className="text-xs mt-1">有什么关于睡眠的问题都可以问我</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={cn(
            'flex gap-3',
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          <div
            className={cn(
              'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}
          >
            {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-3 py-2 text-sm',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted',
            )}
          >
            {message.parts.map((part, i) => {
              if (part.type === 'text') {
                return message.role === 'user'
                  ? (
                      <p key={i} className="whitespace-pre-wrap">{part.text}</p>
                    )
                  : (
                      <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                      </div>
                    );
              }
              return null;
            })}
          </div>
        </div>
      ))}
      {status === 'submitted' && (
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div className="bg-muted rounded-lg px-3 py-2 text-sm">
            <div className="flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
