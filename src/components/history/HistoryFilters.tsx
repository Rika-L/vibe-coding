'use client';

import { Calendar, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface HistoryFiltersProps {
  startDate: string;
  endDate: string;
  filtering: boolean;
  totalRecords: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onFilter: () => void;
  onClear: () => void;
}

export function HistoryFilters({
  startDate,
  endDate,
  filtering,
  totalRecords,
  onStartDateChange,
  onEndDateChange,
  onFilter,
  onClear,
}: HistoryFiltersProps) {
  return (
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
          {totalRecords > 0 && (
            <span className="text-sm text-muted-foreground">
              找到
              {' '}
              {totalRecords}
              {' '}
              条记录
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
