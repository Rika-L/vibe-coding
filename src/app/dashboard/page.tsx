'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Moon,
  Calendar,
  Loader2,
  AlertCircle,
  History,
  LogOut,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SleepTrendChart,
  SleepStructureChart,
  SleepScoreGauge,
  BedTimeCard,
  WakeTimeCard,
  HeartRateCard,
  HeartRateChart,
  SleepRegularityChart,
} from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { DateRangeDialog } from '@/components/date-range-dialog';

// 前端请求超时时间 (毫秒)
const FETCH_TIMEOUT = 90000;

interface SleepRecord {
  id: string;
  date: string;
  sleepDuration: number;
  deepSleep: number | null;
  lightSleep: number | null;
  remSleep: number | null;
  sleepScore: number | null;
  bedTime: string | null;
  wakeTime: string | null;
  heartRate: number | null;
}

// 计算睡眠效率
const calculateEfficiency = (record: SleepRecord): number => {
  if (!record.bedTime || !record.wakeTime || record.sleepDuration <= 0) {
    return 0;
  }
  const bedTime = new Date(record.bedTime).getTime();
  const wakeTime = new Date(record.wakeTime).getTime();
  const timeInBed = (wakeTime - bedTime) / (1000 * 60 * 60); // 转换为小时
  if (timeInBed <= 0) return 0;
  return Math.round((record.sleepDuration / timeInBed) * 100);
};

// 获取状态标签
const getEfficiencyStatus = (efficiency: number): { label: string; color: string } => {
  if (efficiency >= 85) return { label: '良好', color: 'bg-green-500' };
  if (efficiency >= 70) return { label: '一般', color: 'bg-yellow-500' };
  return { label: '需改善', color: 'bg-red-500' };
};

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

  useEffect(() => {
    fetchData();
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

  // 带超时的 fetch
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

  const recordsWithScore = records.filter(r => r.sleepScore !== null);
  const avgScore = recordsWithScore.length > 0
    ? records.reduce((sum, r) => sum + (r.sleepScore || 0), 0) / recordsWithScore.length
    : 0;

  const chartData = records.map(r => ({
    date: new Date(r.date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    }),
    duration: r.sleepDuration,
    score: r.sleepScore,
  }));

  const structureData = records.map(r => ({
    deep: r.deepSleep,
    light: r.lightSleep,
    rem: r.remSleep,
  }));

  const bedTimeData = records
    .filter(r => r.bedTime !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
      bedTime: r.bedTime!,
    }));

  const wakeTimeData = records
    .filter(r => r.wakeTime !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
      wakeTime: r.wakeTime!,
    }));

  const heartRateData = records
    .filter(r => r.heartRate !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
      heartRate: r.heartRate!,
    }));

  const regularityData = records
    .filter(r => r.bedTime !== null && r.wakeTime !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
      bedTime: r.bedTime!,
      wakeTime: r.wakeTime!,
    }));

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
            <Button variant="outline" size="sm" onClick={handleLogout} aria-label="登出">
              <LogOut className="h-4 w-4" />
            </Button>
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

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center gap-6 bg-background">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive/50" />
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              加载失败
            </h2>
            <p className="text-muted-foreground">网络错误，请稍后重试</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => fetchData()}>
              重新加载
            </Button>
            <Link href="/">
              <Button>返回上传</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !loadError && records.length === 0 && (
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
      )}

      {/* Main Content */}
      {!loading && !loadError && records.length > 0 && (
        <main className="container mx-auto px-4 py-8">
          {/* Filter Section */}
          <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    开始日期
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    结束日期
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleFilter} disabled={filtering} className="gap-2">
                  {filtering
                    ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          筛选中...
                        </>
                      )
                    : (
                        <>
                          <Search className="h-4 w-4" />
                          筛选
                        </>
                      )}
                </Button>
                <Button variant="outline" onClick={clearFilter} className="gap-2">
                  <X className="h-4 w-4" />
                  清除
                </Button>
                {records.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    显示
                    {' '}
                    {records.length}
                    {' '}
                    条记录
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid - 4 columns with new cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Sleep Efficiency - 在其他卡片之前 */}
            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  睡眠效率
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latestRecord = records[0];
                  const efficiency = calculateEfficiency(latestRecord);
                  const status = getEfficiencyStatus(efficiency);
                  return (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{efficiency}</span>
                        <span className="text-lg text-muted-foreground">%</span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Sleep Score */}
            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-4">
                <SleepScoreGauge score={Math.round(avgScore)} />
              </CardContent>
            </Card>

            {/* Bed Time */}
            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
              <CardContent className="p-4">
                <BedTimeCard data={bedTimeData} />
              </CardContent>
            </Card>

            {/* Wake Time */}
            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
              <CardContent className="p-4">
                <WakeTimeCard data={wakeTimeData} />
              </CardContent>
            </Card>

            {/* Heart Rate */}
            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5">
              <CardContent className="p-4">
                <HeartRateCard data={heartRateData} />
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Sleep Trend Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">睡眠趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <SleepTrendChart data={chartData} />
              </CardContent>
            </Card>

            {/* Sleep Structure Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">平均睡眠结构</CardTitle>
              </CardHeader>
              <CardContent>
                <SleepStructureChart data={structureData} />
              </CardContent>
            </Card>

            {/* Heart Rate Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">心率趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <HeartRateChart data={heartRateData} />
              </CardContent>
            </Card>

            {/* Sleep Regularity Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">睡眠规律</CardTitle>
              </CardHeader>
              <CardContent>
                <SleepRegularityChart data={regularityData} />
              </CardContent>
            </Card>
          </div>
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

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]">
      <CardContent className="p-6">
        <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
