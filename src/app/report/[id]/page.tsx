"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Lightbulb,
  FileText,
  Moon,
  Star,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

interface Report {
  id: string;
  title: string;
  summary: string;
  suggestions: string;
  sleepQuality: string;
  dataRange: string;
  createdAt: string;
}

type PageState = "loading" | "error" | "not_found" | "success";

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setPageState("not_found");
        } else {
          throw new Error("网络请求失败");
        }
        return;
      }
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        setPageState("success");
      } else {
        setPageState("not_found");
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setPageState("error");
      toast.error("加载报告失败");
    }
  };

  if (pageState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (pageState === "error") {
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
          <Button variant="outline" onClick={() => fetchReport()}>
            重新加载
          </Button>
          <Link href="/dashboard">
            <Button>返回看板</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (pageState === "not_found" || !report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            报告不存在
          </h2>
          <p className="text-muted-foreground">该报告可能已被删除</p>
        </div>
        <Link href="/dashboard">
          <Button>返回看板</Button>
        </Link>
      </div>
    );
  }

  const qualityConfig = {
    优秀: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    良好: {
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    一般: {
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    较差: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  };

  const qualityStyle =
    qualityConfig[report.sleepQuality as keyof typeof qualityConfig] ||
    qualityConfig["良好"];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            返回看板
          </Link>

          <ThemeToggle />

          <div className="w-25" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Report Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Moon className="h-4 w-4" />
            AI 分析报告
          </div>
          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            {report.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(report.createdAt).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="rounded-full bg-muted px-3 py-1">
              数据范围：{report.dataRange}
            </span>
          </div>
        </div>

        {/* Sleep Quality Card */}
        <Card
          className={`mb-8 border-2 ${qualityStyle.border} ${qualityStyle.bg}`}
        >
          <CardContent className="flex flex-col items-center py-8">
            <Star className={`mb-4 h-12 w-12 ${qualityStyle.color}`} />
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              睡眠质量评价
            </p>
            <p className={`text-5xl font-bold ${qualityStyle.color}`}>
              {report.sleepQuality}
            </p>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <FileText className="h-5 w-5 text-primary" />
              分析总结
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground/90">
              {report.summary}
            </p>
          </CardContent>
        </Card>

        {/* Suggestions Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              改善建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-primary/5 p-6">
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                {report.suggestions}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">返回看板</Button>
          </Link>
          <Link href="/">
            <Button>上传新数据</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
