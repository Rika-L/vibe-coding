"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar,
  TrendingUp,
  Database,
  Moon,
} from "lucide-react";
import {
  SleepTrendChart,
  SleepStructureChart,
  SleepScoreGauge,
} from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sleep-data");
      const data = await res.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST" });
      const data = await res.json();
      if (data.report) {
        window.location.href = `/report/${data.report.id}`;
      }
    } catch (error) {
      alert("分析失败，请重试");
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

  const avgScore =
    records.reduce((sum, r) => sum + (r.sleepScore || 0), 0) /
    records.filter((r) => r.sleepScore).length || 0;

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
  const avgDeep =
    records.reduce((sum, r) => sum + (r.deepSleep || 0), 0) /
    records.filter((r) => r.deepSleep).length || 0;
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
              <Sparkles className="h-4 w-4" />
              {analyzing ? "分析中..." : "生成 AI 报告"}
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
