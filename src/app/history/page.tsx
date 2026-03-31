"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Moon,
  Loader2,
  LogOut,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoadError(false);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/sleep-history?${params}`);

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?redirect=/history");
          return;
        }
        throw new Error("网络请求失败");
      }

      const data = await res.json();
      setRecords(data.records || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  }, [pagination.page, pagination.pageSize, startDate, endDate, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("已登出");
      router.push("/login");
    } catch {
      toast.error("登出失败");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilter = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFiltering(true);
    setLoading(true);
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setLoading(true);
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
          <Link href="/dashboard">
            <Button>返回看板</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>

          <h1 className="text-lg font-semibold text-foreground">历史数据</h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">筛选条件</CardTitle>
          </CardHeader>
          <CardContent>
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
                    onChange={(e) => setStartDate(e.target.value)}
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
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleFilter} disabled={filtering} className="gap-2">
                {filtering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    筛选中...
                  </>
                ) : (
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
              {pagination.total > 0 && (
                <span className="text-sm text-muted-foreground">
                  找到 {pagination.total} 条记录
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              睡眠记录 ({pagination.total} 条)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="py-12 text-center">
                <Moon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">暂无数据</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          日期
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          睡眠时长
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          深睡
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          浅睡
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          REM
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          评分
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b border-border/50 transition-colors hover:bg-muted/50"
                        >
                          <td className="px-4 py-3 text-sm">
                            {new Date(record.date).toLocaleDateString("zh-CN")}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {record.sleepDuration.toFixed(1)}h
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record.deepSleep ? `${record.deepSleep.toFixed(1)}h` : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record.lightSleep ? `${record.lightSleep.toFixed(1)}h` : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record.remSleep ? `${record.remSleep.toFixed(1)}h` : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record.sleepScore ? (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  record.sleepScore >= 80
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : record.sleepScore >= 60
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {record.sleepScore}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    第 {pagination.page} / {pagination.totalPages} 页
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
