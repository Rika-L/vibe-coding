'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { content: string }[];
}

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  refreshTrigger?: number;
}

export function ConversationList({ selectedId, onSelect, onNew, refreshTrigger }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok)
        throw new Error('获取对话列表失败');
      const data = await res.json();
      setConversations(data.conversations);
    }
    catch (error) {
      console.error('Fetch conversations error:', error);
      toast.error('获取对话列表失败');
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('确定要删除这个对话吗？'))
      return;

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok)
        throw new Error('删除失败');
      toast.success('对话已删除');
      fetchConversations();
      if (selectedId === id) {
        onNew();
      }
    }
    catch (error) {
      console.error('Delete conversation error:', error);
      toast.error('删除对话失败');
    }
  };

  if (isLoading) {
    return (
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-3 border-b">
        <Button onClick={onNew} variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          新对话
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0
          ? (
              <p className="text-xs text-muted-foreground text-center py-4">暂无对话记录</p>
            )
          : (
              conversations.map(conv => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group transition-colors',
                    selectedId === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    type="button"
                    onClick={e => handleDelete(conv.id, e)}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20',
                      selectedId === conv.id && 'hover:bg-primary-foreground/20',
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
      </div>
    </div>
  );
}
