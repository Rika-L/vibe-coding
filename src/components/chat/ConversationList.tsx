'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Plus, Trash2, MessageSquare, Pencil } from 'lucide-react';
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

  // 重命名相关状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 开始重命名
  const startRename = (conv: Conversation, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
    // 自动聚焦输入框
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 取消重命名
  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // 提交重命名
  const submitRename = async (id: string) => {
    const title = editingTitle.trim();
    if (!title) {
      cancelRename();
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('重命名失败');
      toast.success('对话已重命名');
      fetchConversations();
    }
    catch (error) {
      console.error('Rename conversation error:', error);
      toast.error('重命名失败');
    }
    finally {
      setEditingId(null);
      setEditingTitle('');
    }
  };

  // 处理输入框按键
  const handleRenameKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      submitRename(id);
    }
    else if (e.key === 'Escape') {
      cancelRename();
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
                <ContextMenu key={conv.id}>
                  <ContextMenuTrigger>
                    <div
                      onClick={() => onSelect(conv.id)}
                      onDoubleClick={() => startRename(conv)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group transition-all cursor-pointer hover:bg-muted hover:scale-[1.02]',
                        selectedId === conv.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted',
                      )}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      {editingId === conv.id
                        ? (
                            <input
                              ref={inputRef}
                              type="text"
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              onBlur={() => submitRename(conv.id)}
                              onKeyDown={e => handleRenameKeyDown(e, conv.id)}
                              onClick={e => e.stopPropagation()}
                              className={cn(
                                'flex-1 min-w-0 bg-transparent border-b outline-none px-0 py-0 text-sm',
                                selectedId === conv.id
                                  ? 'border-primary-foreground text-primary-foreground placeholder:text-primary-foreground/50'
                                  : 'border-primary text-foreground placeholder:text-muted-foreground',
                              )}
                            />
                          )
                        : (
                            <span className="flex-1 truncate">{conv.title}</span>
                          )}
                      {editingId !== conv.id && (
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
                      )}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => startRename(conv)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      重命名
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={(e) => {
                        // 阻止事件冒泡，避免触发选中
                        e.stopPropagation();
                        handleDeleteClick(conv.id, e as unknown as React.MouseEvent);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
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
