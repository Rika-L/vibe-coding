"use client";

import { useState, useEffect, useMemo } from "react";
import { format, differenceInDays, eachDayOfInterval } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  CalendarIcon,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (startDate: string, endDate: string) => void;
  loading?: boolean;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function DateRangeDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: DateRangeDialogProps) {
  const [recordDates, setRecordDates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [loadingDates, setLoadingDates] = useState(false);

  // 获取有记录的日期
  useEffect(() => {
    if (open) {
      setLoadingDates(true);
      fetch("/api/sleep-dates")
        .then((res) => res.json())
        .then((data) => {
          setRecordDates(data.dates || []);
          // 计算默认区间（最近连续有记录）
          const defaultRange = calculateDefaultRange(data.dates || []);
          setDateRange(defaultRange);
        })
        .catch(console.error)
        .finally(() => setLoadingDates(false));
    }
  }, [open]);

  // 计算默认区间：从最新记录往前，直到遇到无记录日期
  const calculateDefaultRange = (dates: string[]): DateRange => {
    if (dates.length === 0) return { from: undefined, to: undefined };

    const sortedDates = [...dates].sort().reverse();
    const latestDate = new Date(sortedDates[0]);
    let startDate = latestDate;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diff = differenceInDays(prevDate, currDate);

      if (diff > 1) {
        // 遇到间隔，停止
        break;
      }
      startDate = currDate;
    }

    return { from: startDate, to: latestDate };
  };

  // 计算区间内无记录的天数
  const missingDaysCount = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return 0;

    const allDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const allDaysStr = allDays.map((d) => format(d, "yyyy-MM-dd"));
    const missingDays = allDaysStr.filter((d) => !recordDates.includes(d));

    return missingDays.length;
  }, [dateRange, recordDates]);

  // 有记录的日期集合（用于日历标记）
  const recordDatesSet = useMemo(() => new Set(recordDates), [recordDates]);

  // 自定义日期修饰器，标记有记录的日期
  const modifiers = useMemo(() => ({
    hasRecord: (date: Date) => recordDatesSet.has(format(date, "yyyy-MM-dd")),
  }), [recordDatesSet]);

  const modifiersStyles = {
    hasRecord: {
      fontWeight: "bold" as const,
    },
  };

  const handleConfirm = () => {
    if (dateRange.from && dateRange.to) {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");
      onConfirm(startDate, endDate);
    }
  };

  const formatDateRange = () => {
    if (!dateRange.from) return "选择日期范围";
    if (!dateRange.to) return format(dateRange.from, "yyyy年MM月dd日", { locale: zhCN });
    return `${format(dateRange.from, "yyyy年MM月dd日", { locale: zhCN })} - ${format(dateRange.to, "yyyy年MM月dd日", { locale: zhCN })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            选择分析区间
          </DialogTitle>
          <DialogDescription>
            选择要分析的睡眠记录日期范围
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 日期范围选择器 */}
          <div className="flex items-center justify-center gap-2">
            <Popover>
              <PopoverTrigger render={
                <Button variant="outline" className="flex-1 justify-start text-left font-normal" />
              }>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, "yyyy/MM/dd") : "开始日期"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  locale={zhCN}
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">至</span>

            <Popover>
              <PopoverTrigger render={
                <Button variant="outline" className="flex-1 justify-start text-left font-normal" />
              }>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? format(dateRange.to, "yyyy/MM/dd") : "结束日期"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  locale={zhCN}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 日历范围选择 */}
          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange(range as DateRange)}
              numberOfMonths={1}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={zhCN}
              className="rounded-md border"
            />
          </div>

          {/* 无记录提示 */}
          {missingDaysCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>该区间内有 {missingDaysCount} 天无记录</span>
            </div>
          )}

          {/* 选中范围显示 */}
          {dateRange.from && dateRange.to && (
            <p className="text-center text-sm text-muted-foreground">
              已选择：{formatDateRange()}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!dateRange.from || !dateRange.to || loading || loadingDates}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成报告
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
