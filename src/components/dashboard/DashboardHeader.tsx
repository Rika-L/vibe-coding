'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  History,
  LogOut,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardHeaderProps {
  userInfo: { name: string | null; avatar: string | null } | null;
  analyzing: boolean;
  analyzeProgress: string;
  loading: boolean;
  loadError: boolean;
  recordsLength: number;
  onAnalyze: () => void;
  onLogout: () => void;
}

export function DashboardHeader({
  userInfo,
  analyzing,
  analyzeProgress,
  loading,
  loadError,
  recordsLength,
  onAnalyze,
  onLogout,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>

        <h1 className="text-lg font-semibold text-foreground">
          睡眠数据看板
        </h1>

        <div className="flex items-center gap-2">
          <Link href="/history">
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              历史数据
            </Button>
          </Link>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <span className="text-lg cursor-pointer">{userInfo?.avatar || '👤'}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push('/settings')} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                用户设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={onAnalyze}
            disabled={analyzing || loading || loadError || recordsLength === 0}
            className="gap-2"
          >
            {analyzing
              ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {analyzeProgress || '分析中...'}
                  </>
                )
              : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    生成 AI 报告
                  </>
                )}
          </Button>
        </div>
      </div>
    </header>
  );
}
