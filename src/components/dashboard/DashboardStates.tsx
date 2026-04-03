'use client';

import Link from 'next/link';
import { Moon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStatesProps {
  loading: boolean;
  loadError: boolean;
  recordsLength: number;
  onRetry: () => void;
}

export function DashboardStates({
  loading,
  loadError,
  recordsLength,
  onRetry,
}: DashboardStatesProps) {
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center gap-6 bg-background">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive/50" />
          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            加载失败
          </h2>
          <p className="text-muted-foreground">网络错误，请稍后重试</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onRetry}>
            重新加载
          </Button>
          <Link href="/">
            <Button>返回上传</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (recordsLength === 0) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center gap-6 bg-background">
        <div className="text-center">
          <Moon className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            暂无数据
          </h2>
          <p className="text-muted-foreground">请先上传 CSV 文件</p>
        </div>
        <Link href="/">
          <Button>返回上传</Button>
        </Link>
      </div>
    );
  }

  return null;
}
