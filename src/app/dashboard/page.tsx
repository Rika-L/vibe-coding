"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar,
  TrendingUp,
  Database,
  Moon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  SleepTrendChart,
  SleepStructureChart,
  SleepScoreGauge,
} from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

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
}

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadError(false);
      const res = await fetch("/api/sleep-data");
      if (!res.ok) {
        throw new Error("网络请求失败");
      }
      const data = await res.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("请求超时，请重试");
      }
      throw error;
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeProgress("正在分析数据...");

    try {
      const res = await fetchWithTimeout(
        "/api/analyze",
        { method: "POST" },
        FETCH_TIMEOUT
      );
      const data = await res.json();

      if (data.report) {
        setAnalyzeProgress("分析完成！");
        toast.success("报告生成成功");
        router.push(`/report/${data.report.id}`);
      } else {
        toast.error(data.error || "分析失败");
        setAnalyzing(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "分析失败，请重试";
      toast.error(message);
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
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
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
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

  const recordsWithScore = records.filter((r) => r.sleepScore !== null);
  const avgScore = recordsWithScore.length > 0
    ? records.reduce((sum, r) => sum + (r.sleepScore || 0), 0) / recordsWithScore.length
    : 0;

  const chartData = records.map((r) => ({
    date: new Date(r.date).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    }),
    duration: r.sleepDuration,
    score: r.sleepScore,
  }));

  const structureData = records.map((r) => ({
    deep: r.deepSleep,
    light: r.lightSleep,
    rem: r.remSleep,
  }));

  const avgDuration =
    records.reduce((sum, r) => sum + r.sleepDuration, 0) / records.length;

  const recordsWithDeep = records.filter((r) => r.deepSleep !== null);
  const avgDeep = recordsWithDeep.length > 0
    ? records.reduce((sum, r) => sum + (r.deepSleep || 0), 0) / recordsWithDeep.length
    : 0;

  const dataCompleteness =
    (records.filter((r) => r.sleepScore).length / records.length) * 100;

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
            <ThemeToggle />
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {analyzeProgress || "分析中..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  生成 AI 报告
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={Clock}
            title="平均睡眠时长"
            value={`${avgDuration.toFixed(1)}h`}
            subtitle="每日平均"
          />
          <StatCard
            icon={Calendar}
            title="记录天数"
            value={`${records.length}天`}
            subtitle="累计记录"
          />
          <StatCard
            icon={TrendingUp}
            title="平均深睡"
            value={`${avgDeep.toFixed(1)}h`}
            subtitle="深度睡眠"
          />
          <StatCard
            icon={Database}
            title="数据完整度"
            value={`${Math.round(dataCompleteness)}%`}
            subtitle="有效数据"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sleep Score Gauge */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">睡眠评分</CardTitle>
            </CardHeader>
            <CardContent>
              <SleepScoreGauge score={Math.round(avgScore)} />
            </CardContent>
          </Card>

          {/* Sleep Trend Chart */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">睡眠趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <SleepTrendChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* Sleep Structure Chart */}
        <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">平均睡眠结构</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepStructureChart data={structureData} />
          </CardContent>
        </Card>
      </main>
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
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
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
