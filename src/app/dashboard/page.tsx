'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { DateRangeDialog } from '@/components/date-range-dialog';
import {
  StatsCards,
  ChartsGrid,
  DashboardStates,
  DateFilter,
} from '@/components/dashboard';
import { computeChartData } from '@/components/dashboard/chartData';
import type { SleepRecord } from '@/lib/types';

// 前端请求超时时间 (毫秒)
const FETCH_TIMEOUT = 60000;

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string | null; avatar: string | null } | null>(null);

  useEffect(() => {
    fetchData();
    fetch('/api/user/profile')
      .then(res => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) {
          setUserInfo(data.user);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (filterStart?: string, filterEnd?: string) => {
    try {
      setLoadError(false);
      const params = new URLSearchParams();
      if (filterStart) params.set('startDate', filterStart);
      if (filterEnd) params.set('endDate', filterEnd);

      const url = `/api/sleep-data${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?redirect=/dashboard');
          return;
        }
        throw new Error('网络请求失败');
      }
      const data = await res.json();
      setRecords(data.records || []);
    }
    catch (error) {
      console.error('Failed to fetch data:', error);
      setLoadError(true);
    }
    finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('已登出');
      router.push('/login');
    }
    catch {
      toast.error('登出失败');
    }
  };

  const handleFilter = () => {
    setFiltering(true);
    setLoading(true);
    fetchData(startDate, endDate);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setLoading(true);
    fetchData();
  };

  const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    }
    catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时，请重试');
      }
      throw error;
    }
  };

  const handleAnalyze = async (startDate?: string, endDate?: string) => {
    setAnalyzing(true);
    setAnalyzeProgress('正在分析数据...');
    setDialogOpen(false);

    try {
      const res = await fetchWithTimeout(
        '/api/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate }),
        },
        FETCH_TIMEOUT,
      );
      const data = await res.json();

      if (data.report) {
        setAnalyzeProgress('分析完成！');
        toast.success('报告生成成功');
        router.push(`/report/${data.report.id}`);
      }
      else {
        toast.error(data.error || '分析失败');
        setAnalyzing(false);
      }
    }
    catch (error) {
      const message = error instanceof Error ? error.message : '分析失败，请重试';
      toast.error(message);
      setAnalyzing(false);
    }
  };

  // Compute derived data with memoization
  const {
    avgScore,
    chartData,
    structureData,
    bedTimeData,
    wakeTimeData,
    heartRateData,
    regularityData,
  } = useMemo(() => computeChartData(records), [records]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
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
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={analyzing || loading || loadError || records.length === 0}
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

      {/* States (Loading/Error/Empty) */}
      <DashboardStates
        loading={loading}
        loadError={loadError}
        recordsLength={records.length}
        onRetry={() => fetchData()}
      />

      {/* Main Content */}
      {!loading && !loadError && records.length > 0 && (
        <main className="container mx-auto px-4 py-8">
          <DateFilter
            startDate={startDate}
            endDate={endDate}
            filtering={filtering}
            recordsLength={records.length}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onFilter={handleFilter}
            onClear={clearFilter}
          />

          {/* Stats Cards */}
          <StatsCards
            records={records}
            avgScore={avgScore}
            bedTimeData={bedTimeData}
            wakeTimeData={wakeTimeData}
            heartRateData={heartRateData}
          />

          {/* Charts Grid */}
          <ChartsGrid
            chartData={chartData}
            structureData={structureData}
            heartRateData={heartRateData}
            regularityData={regularityData}
          />
        </main>
      )}

      {/* Date Range Dialog */}
      <DateRangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={(startDate, endDate) => handleAnalyze(startDate, endDate)}
        loading={analyzing}
      />
    </div>
  );
}
