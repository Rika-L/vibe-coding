'use client';

import { Clock, Moon, ChevronLeft, ChevronRight, Trash2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SleepRecord } from '@/lib/types';

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface RecordsTabProps {
  records: SleepRecord[];
  pagination: Pagination;
  selectedIds: Set<string>;
  selectAll: boolean;
  deletingId: string | null;
  onSelectOne: (id: string) => void;
  onSelectAll: () => void;
  onPageChange: (page: number) => void;
  onEditRecord: (record: SleepRecord) => void;
  onDeleteRecord: (record: SleepRecord) => void;
  onBatchDelete: () => void;
  onClearAll: () => void;
  onAddRecord?: () => void;
}

export function RecordsTab({
  records,
  pagination,
  selectedIds,
  selectAll,
  deletingId,
  onSelectOne,
  onSelectAll,
  onPageChange,
  onEditRecord,
  onDeleteRecord,
  onBatchDelete,
  onClearAll,
  onAddRecord,
}: RecordsTabProps) {
  return (
    <>
      {/* Add Record Button */}
      {onAddRecord && (
        <div className="mb-4">
          <Button onClick={onAddRecord} className="gap-2">
            <Plus className="h-4 w-4" />
            添加记录
          </Button>
        </div>
      )}

      {records.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            已选择
            {' '}
            <span className="font-medium text-foreground">{selectedIds.size}</span>
            {' '}
            条记录
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBatchDelete}
              disabled={selectedIds.size === 0 || !!deletingId}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              批量删除
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearAll}
              disabled={pagination.total === 0 || !!deletingId}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              清空全部
            </Button>
          </div>
        </div>
      )}

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
          {records.length === 0
            ? (
                <div className="py-12 text-center">
                  <Moon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">暂无数据</p>
                </div>
              )
            : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-10">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={onSelectAll}
                              className="h-4 w-4 rounded border-border"
                            />
                          </th>
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
                            className="cursor-pointer border-b border-border/50 transition-all duration-200 hover:bg-muted"
                          >
                            <td className="px-4 py-3 w-10">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(record.id)}
                                onChange={() => onSelectOne(record.id)}
                                className="h-4 w-4 rounded border-border"
                              />
                            </td>
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
                                      className={cn(
                                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                        record.sleepScore >= 80
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                          : record.sleepScore >= 60
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                      )}
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
                                  onClick={() => onEditRecord(record)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onDeleteRecord(record)}
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
                </>
              )}
        </CardContent>
      </Card>
    </>
  );
}
