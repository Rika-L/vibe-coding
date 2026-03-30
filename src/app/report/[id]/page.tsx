"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Lightbulb } from "lucide-react";

interface Report {
  id: string;
  title: string;
  summary: string;
  suggestions: string;
  sleepQuality: string;
  dataRange: string;
  createdAt: string;
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      const found = data.reports?.find((r: Report) => r.id === id);
      if (found) {
        setReport(found);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-600">报告不存在</p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
        >
          返回看板
        </Link>
      </div>
    );
  }

  const qualityColor =
    report.sleepQuality === "优秀"
      ? "text-green-600"
      : report.sleepQuality === "良好"
        ? "text-blue-600"
        : report.sleepQuality === "一般"
          ? "text-yellow-600"
          : "text-red-600";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          返回看板
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {report.title}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(report.createdAt).toLocaleDateString("zh-CN")}
            </span>
            <span>数据范围：{report.dataRange}</span>
          </div>

          <div className="mb-8">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              睡眠质量评价
            </div>
            <div className={`text-4xl font-bold ${qualityColor}`}>
              {report.sleepQuality}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              分析总结
            </h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              {report.summary}
            </p>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              改善建议
            </h2>
            <div className="rounded-xl bg-indigo-50 p-6 dark:bg-indigo-900/20">
              <p className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                {report.suggestions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
