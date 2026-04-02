'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.status === 401) {
        router.push('/login?redirect=/settings');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    }
    catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('加载失败');
    }
    finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setProfileOpen(false);
    toast.success('资料已更新');
  };

  const handlePasswordChange = () => {
    setPasswordOpen(false);
    toast.success('密码已修改');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">用户设置</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* 头像和名称卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              头像和名称
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                  {user?.avatar || '👤'}
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {user?.name || '未设置名称'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    点击编辑修改头像和名称
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setProfileOpen(true)}>
                编辑
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 账号安全卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              账号安全
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">邮箱</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-sm text-muted-foreground">密码</p>
                <p className="font-medium">••••••••</p>
              </div>
              <Button variant="outline" onClick={() => setPasswordOpen(true)}>
                修改密码
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 账号信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              账号信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">注册时间</p>
                <p className="font-medium">{createdDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 编辑资料弹窗 */}
      <ProfileForm
        open={profileOpen}
        onOpenChange={setProfileOpen}
        user={user}
        onSuccess={handleProfileUpdate}
      />

      {/* 修改密码弹窗 */}
      <PasswordForm
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onSuccess={handlePasswordChange}
      />
    </div>
  );
}
