"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  SleepTrendChart,
  SleepStructureChart,
  SleepScoreGauge,
} from "@/components/charts";

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
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-600">暂无数据，请先上传 CSV 文件</p>
        <Link
          href="/"
          className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
        >
          返回上传
        </Link>
      </div>
    );
  }

  const avgScore =
    records.reduce((sum, r) => sum + (r.sleepScore || 0), 0) /
    records.filter((r) => r.sleepScore).length || 0;

  const chartData = records.map((r) => ({
    date: new Date(r.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    duration: r.sleepDuration,
    score: r.sleepScore,
  }));

  const structureData = records.map((r) => ({
    deep: r.deepSleep,
    light: r.lightSleep,
    rem: r.remSleep,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            返回
          </Link>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {analyzing ? "分析中..." : "生成 AI 报告"}
          </button>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          睡眠数据看板
        </h1>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <SleepScoreGauge score={Math.round(avgScore)} />
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 lg:col-span-2">
            <SleepTrendChart data={chartData} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <SleepStructureChart data={structureData} />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            title="平均睡眠时长"
            value={`${(records.reduce((sum, r) => sum + r.sleepDuration, 0) / records.length).toFixed(1)}h`}
          />
          <StatCard
            title="记录天数"
            value={`${records.length}天`}
          />
          <StatCard
            title="平均深睡"
            value={`${(records.reduce((sum, r) => sum + (r.deepSleep || 0), 0) / records.filter((r) => r.deepSleep).length || 0).toFixed(1)}h`}
          />
          <StatCard
            title="数据完整度"
            value={`${Math.round((records.filter((r) => r.sleepScore).length / records.length) * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
