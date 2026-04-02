'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sparkles,
  Trash2,
  Star,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { SleepRecordDialog } from '@/components/sleep-record-dialog';
import { cn } from '@/lib/utils';

type TabType = 'records' | 'reports';

interface SleepRecord {
  id: string;
  date: string;
  sleepDuration: number;
  deepSleep: number | null;
  lightSleep: number | null;
  remSleep: number | null;
  sleepScore: number | null;
  bedTime?: string;
  wakeTime?: string;
  awakeCount?: number | null;
  heartRate?: number | null;
}

interface AnalysisReport {
  id: string;
  title: string;
  summary: string;
  sleepQuality: string;
  dataRange: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoadError(false);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/sleep-history?${params}`);

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?redirect=/history');
          return;
        }
        throw new Error('网络请求失败');
      }

      const data = await res.json();
      setRecords(data.records || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    }
    catch (error) {
      console.error('Failed to fetch data:', error);
      setLoadError(true);
    }
    finally {
      setLoading(false);
      setFiltering(false);
    }
  }, [pagination.page, pagination.pageSize, startDate, endDate, router]);

  const fetchReports = useCallback(async () => {
    try {
      setLoadError(false);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: '10',
      });

      const res = await fetch(`/api/reports?${params}`);

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?redirect=/history');
          return;
        }
        throw new Error('网络请求失败');
      }

      const data = await res.json();
      setReports(data.reports || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    }
    catch (error) {
      console.error('Failed to fetch reports:', error);
      setLoadError(true);
    }
    finally {
      setLoading(false);
    }
  }, [pagination.page, router]);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'records') {
      fetchData();
    }
    else {
      fetchReports();
    }
  }, [activeTab, fetchData, fetchReports]);

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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFiltering(true);
    setLoading(true);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, page: 1 }));
    setFiltering(true);
    setLoading(true);
    // 主动触发数据获取，确保 loading 状态能被正确重置
    fetchData();
  };

  const handleDeleteReport = async (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;

    setDeletingId(reportToDelete);
    try {
      const res = await fetch(`/api/reports/${reportToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }

      toast.success('报告已删除');
      fetchReports();
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
    finally {
      setDeletingId(null);
      setReportToDelete(null);
    }
  };

  const handleEditRecord = (record: SleepRecord) => {
    setSelectedRecord({
      ...record,
      bedTime: record.bedTime ? new Date(record.bedTime).toTimeString().slice(0, 5) : undefined,
      wakeTime: record.wakeTime ? new Date(record.wakeTime).toTimeString().slice(0, 5) : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteRecord = (record: SleepRecord) => {
    setSelectedRecord(record);
    setDeleteRecordDialogOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!selectedRecord) return;

    setDeletingId(selectedRecord.id);
    try {
      const res = await fetch(`/api/sleep-records/${selectedRecord.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }

      toast.success('记录已删除');
      setDeleteRecordDialogOpen(false);
      fetchData();
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
    finally {
      setDeletingId(null);
      setSelectedRecord(null);
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
          <Button
            variant="outline"
            onClick={() => (activeTab === 'records' ? fetchData() : fetchReports())}
          >
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
            <Button variant="outline" size="sm" onClick={handleLogout} aria-label="登出">
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tab Switcher */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeTab === 'records' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('records');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            睡眠记录
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('reports');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI 分析报告
          </Button>
        </div>

        {activeTab === 'records' ? (
          <>
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
                  {pagination.total > 0 && (
                    <span className="text-sm text-muted-foreground">
                      找到
                      {' '}
                      {pagination.total}
                      {' '}
                      条记录
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  睡眠记录 (
                  {pagination.total}
                  {' '}
                  条)
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
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map(record => (
                            <tr
                              key={record.id}
                              onClick={() => setSelectedId(record.id === selectedId ? null : record.id)}
                              className={cn(
                                'cursor-pointer border-b border-border/50 transition-all duration-200 hover:bg-muted hover:scale-[1.01]',
                                record.id === selectedId
                                  ? 'bg-primary/10 border-l-2 border-l-primary'
                                  : 'hover:bg-muted/50',
                              )}
                            >
                              <td className="px-4 py-3 text-sm">
                                {new Date(record.date).toLocaleDateString('zh-CN')}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  {record.sleepDuration.toFixed(1)}
                                  h
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {record.deepSleep ? `${record.deepSleep.toFixed(1)}h` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {record.lightSleep ? `${record.lightSleep.toFixed(1)}h` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {record.remSleep ? `${record.remSleep.toFixed(1)}h` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {record.sleepScore
                                  ? (
                                      <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                          record.sleepScore >= 80
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : record.sleepScore >= 60
                                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                      >
                                        {record.sleepScore}
                                      </span>
                                    )
                                  : (
                                      '-'
                                    )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditRecord(record);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRecord(record);
                                    }}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        第
                        {' '}
                        {pagination.page}
                        {' '}
                        /
                        {' '}
                        {pagination.totalPages}
                        {' '}
                        页
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
          </>
        ) : (
          /* Reports Tab */
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                AI 分析报告 (
                {pagination.total}
                {' '}
                份)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="py-12 text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="mb-4 text-muted-foreground">暂无分析报告</p>
                  <Link href="/dashboard">
                    <Button size="sm">生成第一份报告</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const qualityConfig: Record<string, { color: string; bg: string }> = {
                        优秀: { color: 'text-green-500', bg: 'bg-green-500/10' },
                        良好: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        一般: { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        较差: { color: 'text-red-500', bg: 'bg-red-500/10' },
                      };
                      const qualityStyle = qualityConfig[report.sleepQuality] || qualityConfig['良好'];

                      return (
                        <div
                          key={report.id}
                          className="group flex items-start justify-between gap-4 rounded-lg border border-border/50 p-4 transition-all hover:border-primary/30 hover:bg-muted/30"
                        >
                          <Link
                            href={`/report/${report.id}`}
                            className="flex-1 min-w-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn('rounded-lg p-2', qualityStyle.bg)}>
                                <Star className={cn('h-5 w-5', qualityStyle.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-foreground truncate">
                                  {report.title}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {report.summary}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(report.createdAt).toLocaleDateString('zh-CN')}
                                  </span>
                                  <span className={cn('rounded-full px-2 py-0.5', qualityStyle.bg, qualityStyle.color)}>
                                    {report.sleepQuality}
                                  </span>
                                  <span>{report.dataRange}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteReport(report.id)}
                            disabled={deletingId === report.id}
                          >
                            {deletingId === report.id
                              ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )
                              : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        第
                        {' '}
                        {pagination.page}
                        {' '}
                        /
                        {' '}
                        {pagination.totalPages}
                        {' '}
                        页
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
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-7 w-7 text-destructive" />
            </div>
            <AlertDialogHeader className="items-center text-center">
              <AlertDialogTitle className="text-xl">确认删除报告？</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                删除后将无法恢复，该报告的所有数据将被永久移除。
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReport}
              disabled={deletingId === reportToDelete}
              className="w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
            >
              {deletingId === reportToDelete
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      删除中...
                    </>
                  )
                : (
                    '确认删除'
                  )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Record Dialog */}
      <SleepRecordDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        record={selectedRecord}
        onSuccess={fetchData}
      />

      {/* Delete Record Confirmation Dialog */}
      <AlertDialog open={deleteRecordDialogOpen} onOpenChange={setDeleteRecordDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-7 w-7 text-destructive" />
            </div>
            <AlertDialogHeader className="items-center text-center">
              <AlertDialogTitle className="text-xl">确认删除记录？</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                确定要删除这条睡眠记录吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              disabled={deletingId === selectedRecord?.id}
              className="w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
            >
              {deletingId === selectedRecord?.id
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      删除中...
                    </>
                  )
                : (
                    '确认删除'
                  )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
