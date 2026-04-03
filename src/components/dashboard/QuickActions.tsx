'use client';

import { Calendar, Search, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface QuickActionsProps {
  startDate: string;
  endDate: string;
  filtering: boolean;
  analyzing: boolean;
  recordsCount: number;
  loadError: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onFilter: () => void;
  onClear: () => void;
  onAnalyze: () => void;
}

export function QuickActions({
  startDate,
  endDate,
  filtering,
  analyzing,
  recordsCount,
  loadError,
  onStartDateChange,
  onEndDateChange,
  onClear,
  onFilter,
  onAnalyze,
}: QuickActionsProps) {
  return (
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
                onChange={e => onStartDateChange(e.target.value)}
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
                onChange={e => onEndDateChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={onFilter} disabled={filtering} className="gap-2">
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
          <Button variant="outline" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            清除
          </Button>
          {recordsCount > 0 && (
            <span className="text-sm text-muted-foreground">
              显示
              {' '}
              {recordsCount}
              {' '}
              条记录
            </span>
          )}
          <Button
            onClick={onAnalyze}
            disabled={analyzing || loadError || recordsCount === 0}
            className="gap-2 ml-auto"
          >
            {analyzing
              ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    分析中...
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
      </CardContent>
    </Card>
  );
}
