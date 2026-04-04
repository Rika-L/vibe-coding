'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, FileUp, Loader2, Moon, Brain, BarChart3, Lightbulb, LogIn, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { SleepRecordDialog } from '@/components/sleep-record-dialog';
import { CanvasBackground } from '@/components/canvas-background';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface UserInfo {
  name: string | null;
  avatar: string | null;
}

export default function Home() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 检查用户登录状态
    fetch('/api/auth/me')
      .then(res => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // 只有登录后才获取用户详细信息
          return fetch('/api/user/profile');
        }
        return null;
      })
      .then((res) => {
        if (res) {
          return res.ok ? res.json() : null;
        }
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUserInfo(data.user);
        }
      })
      .catch(() => {
        // 忽略错误
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast.success('已登出');
    }
    catch {
      toast.error('登出失败');
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('请上传 CSV 文件');
      return;
    }

    if (!user) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        if (data.failedCount > 0) {
          toast.warning(`成功导入 ${data.count} 条记录，${data.failedCount} 条失败`);
        }
        else {
          toast.success(`成功导入 ${data.count} 条记录`);
        }
        // 延迟跳转，给用户反应时间
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
      else {
        toast.error(data.error || '上传失败');
        setIsUploading(false);
      }
    }
    catch {
      toast.error('上传出错，请重试');
      setIsUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    }
    else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, [handleUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (!isUploading && inputRef.current) {
      inputRef.current.value = ''; // 允许重复选择同一文件
      inputRef.current.click();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Canvas 背景 - 覆盖整个页面 */}
      <div className="fixed inset-0 -z-10">
        <CanvasBackground className="h-full w-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Moon className="h-5 w-5 text-primary" />
            <span>睡眠分析</span>
          </Link>

          <div className="flex items-center gap-2">
            {checkingAuth
              ? null
              : user
                ? (
                    <>
                      <Link href="/dashboard">
                        <Button size="sm" className="gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          看板
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none">
                          <span className="text-lg cursor-pointer">{userInfo?.avatar || '👤'}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push('/settings')} className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            用户设置
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                            <LogOut className="h-4 w-4" />
                            退出登录
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )
                : (
                    <Link href="/login">
                      <Button size="sm" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        登录
                      </Button>
                    </Link>
                  )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Hero Section */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Moon className="h-4 w-4" />
            睡眠健康智能分析
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            睡眠质量分析平台
          </h1>

          <p className="mb-12 text-lg text-muted-foreground md:text-xl">
            上传你的睡眠数据，获取 AI 智能分析报告
            <br />
            了解睡眠模式，改善睡眠质量
          </p>

          {/* Upload Area */}
          <Card
            className={`mx-auto max-w-xl transition-all duration-300 ${
              dragActive
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border/50 bg-card/50 backdrop-blur-sm'
            }`}
          >
            <CardContent className="p-8">
              <div
                className="flex flex-col items-center gap-6"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div
                  className={`rounded-2xl p-6 transition-all duration-300 ${
                    dragActive
                      ? 'bg-primary/20 scale-110'
                      : 'bg-primary/10'
                  }`}
                >
                  {isUploading
                    ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      )
                    : (
                        <Upload className="h-10 w-10 text-primary" />
                      )}
                </div>

                <div className="text-center">
                  <p className="mb-2 text-xl font-semibold text-foreground">
                    {isUploading ? '正在上传...' : '拖拽 CSV 文件到这里'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    或点击下方按钮选择文件
                  </p>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleChange}
                  disabled={isUploading}
                />
                <Button
                  size="lg"
                  className="gap-2 px-8"
                  disabled={isUploading}
                  onClick={handleButtonClick}
                >
                  <FileUp className="h-4 w-4" />
                  选择文件
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manual Add Entry */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            或
            {' '}
            <button
              onClick={() => {
                if (!user) {
                  toast.error('请先登录');
                  router.push('/login');
                  return;
                }
                setAddDialogOpen(true);
              }}
              className="text-primary hover:underline"
            >
              手动添加记录
            </button>
          </p>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="AI 智能分析"
              description="基于大模型深度分析睡眠数据"
            />
            <FeatureCard
              icon={BarChart3}
              title="可视化图表"
              description="直观展示睡眠趋势与结构"
            />
            <FeatureCard
              icon={Lightbulb}
              title="改善建议"
              description="个性化睡眠改善方案"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 bg-background/80 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          睡眠质量分析平台 — 让每一夜都有好梦
        </div>
      </footer>

      {/* Add Record Dialog */}
      <SleepRecordDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => router.push('/history')}
      />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]">
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className="rounded-xl bg-primary/10 p-4 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
