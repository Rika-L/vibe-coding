'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          看板加载失败
        </h2>
        <p className="text-muted-foreground">
          {error.message || '发生了意外错误'}
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={reset}>
          重试
        </Button>
        <Link href="/">
          <Button>返回首页</Button>
        </Link>
      </div>
    </div>
  );
}
