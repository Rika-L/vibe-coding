'use client';

import Link from 'next/link';
import { ArrowLeft, User as UserIcon, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HistoryHeaderProps {
  userInfo: { name: string | null; avatar: string | null } | null;
  onLogout: () => void;
  onSettings: () => void;
}

export function HistoryHeader({ userInfo, onLogout, onSettings }: HistoryHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <h1 className="text-lg font-semibold text-foreground">历史记录</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <span className="text-lg cursor-pointer">{userInfo?.avatar || '👤'}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onSettings} className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> 用户设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" /> 退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
