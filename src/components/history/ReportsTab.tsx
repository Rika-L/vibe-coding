'use client';

import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Star, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

interface ReportsTabProps {
  reports: AnalysisReport[];
  pagination: Pagination;
  deletingId: string | null;
  onDeleteReport: (reportId: string) => void;
  onPageChange: (page: number) => void;
}

export function ReportsTab({
  reports,
  pagination,
  deletingId,
  onDeleteReport,
  onPageChange,
}: ReportsTabProps) {
  const qualityConfig: Record<string, { color: string; bg: string }> = {
    优秀: { color: 'text-green-500', bg: 'bg-green-500/10' },
    良好: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
    一般: { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    较差: { color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  return (
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
        {reports.length === 0
          ? (
              <div className="py-12 text-center">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-4 text-muted-foreground">暂无分析报告</p>
                <Link href="/dashboard">
                  <Button size="sm">生成第一份报告</Button>
                </Link>
              </div>
            )
          : (
              <>
                <div className="space-y-4">
                  {reports.map((report) => {
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
                          onClick={() => onDeleteReport(report.id)}
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
                        onClick={() => onPageChange(pagination.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => onPageChange(pagination.page + 1)}
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
  );
}
