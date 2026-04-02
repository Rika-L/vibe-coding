'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      const res = await fetch(`/api/conversations/${conversationToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除失败');
      toast.success('对话已删除');
      fetchConversations();
      if (selectedId === conversationToDelete) {
        onNew();
      }
    }
    catch (error) {
      console.error('Delete conversation error:', error);
      toast.error('删除对话失败');
    }
    finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
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
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group transition-colors cursor-pointer',
                    selectedId === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    type="button"
                    onClick={e => handleDeleteClick(conv.id, e)}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20',
                      selectedId === conv.id && 'hover:bg-primary-foreground/20',
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-7 w-7 text-destructive" />
            </div>
            <AlertDialogHeader className="items-center text-center">
              <AlertDialogTitle className="text-xl">确认删除对话？</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                删除后将无法恢复，该对话的所有消息将被永久移除。
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
