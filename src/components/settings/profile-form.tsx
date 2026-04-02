'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess: (user: UserProfile) => void;
}

const PRESET_AVATARS = ['😴', '🌙', '⭐', '🐱', '🐶', '🦊', '🐼', '🦁'];

export function ProfileForm({ open, onOpenChange, user, onSuccess }: ProfileFormProps) {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '😴');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (emoji: string) => {
    setAvatar(emoji);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }

    if (name.length > 50) {
      toast.error('名称不能超过 50 个字符');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '更新失败');
        return;
      }

      onSuccess(data.user);
    }
    catch (error) {
      console.error('Update profile error:', error);
      toast.error('更新失败，请重试');
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改资料</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-medium mb-3 block">头像</label>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl border-2 border-dashed">
                {avatar.startsWith('data:') ? (
                  <img src={avatar} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  avatar
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                上传图片
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_AVATARS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAvatarSelect(emoji)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">显示名称</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入名称"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {name.length}
              /50
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
