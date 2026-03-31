# AI 分析日期区间选择功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Dashboard 页面添加日期区间选择对话框，用户可以选择特定日期范围的睡眠记录进行 AI 分析。

**Architecture:** 点击"生成 AI 报告"按钮弹出对话框，使用 shadcn Calendar 组件选择日期范围，日历上标记有记录的日期，后端 API 支持日期参数过滤。

**Tech Stack:** Next.js 16, React, shadcn/ui (Calendar, Popover, Dialog), date-fns, Prisma

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app/dashboard/page.tsx` | 修改 | 添加对话框 UI 和日期选择逻辑 |
| `src/app/api/analyze/route.ts` | 修改 | 支持日期参数查询 |
| `src/app/api/sleep-dates/route.ts` | 新建 | 获取用户所有有记录的日期 |

---

### Task 1: 创建获取有记录日期的 API

**Files:**
- Create: `src/app/api/sleep-dates/route.ts`

- [ ] **Step 1: 创建 API 端点**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const records = await prisma.sleepRecord.findMany({
      where: { userId: user.userId },
      select: { date: true },
      orderBy: { date: "asc" },
    });

    const dates = records.map((r) => r.date.toISOString().split("T")[0]);

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Fetch sleep dates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sleep dates" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/sleep-dates/route.ts
git commit -m "feat: 添加获取用户睡眠记录日期的 API"
```

---

### Task 2: 修改后端分析 API 支持日期参数

**Files:**
- Modify: `src/app/api/analyze/route.ts`

- [ ] **Step 1: 修改 POST 函数接收日期参数**

将现有的 `POST` 函数修改为：

```typescript
import { NextResponse } from "next/server";
import { generateSleepAnalysis } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface SleepRecord {
  date: Date;
  sleepDuration: number;
  deepSleep: number | null;
  lightSleep: number | null;
  remSleep: number | null;
  sleepScore: number | null;
  heartRate: number | null;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    // 解析请求体获取日期参数
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    try {
      const body = await request.json();
      if (body.startDate) {
        startDate = new Date(body.startDate);
      }
      if (body.endDate) {
        endDate = new Date(body.endDate);
        // 设置为当天结束时间
        endDate.setHours(23, 59, 59, 999);
      }
    } catch {
      // 如果没有请求体，使用默认逻辑
    }

    // 构建查询条件
    const whereClause: { userId: string; date?: { gte?: Date; lte?: Date } } = {
      userId: user.userId,
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const records = await prisma.sleepRecord.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: "所选区间内没有睡眠数据" },
        { status: 400 }
      );
    }

    const dataSummary = records.map((r: SleepRecord) => ({
      date: r.date.toISOString().split("T")[0],
      duration: r.sleepDuration,
      deep: r.deepSleep,
      light: r.lightSleep,
      rem: r.remSleep,
      score: r.sleepScore,
      heartRate: r.heartRate,
    }));

    const avgDuration =
      records.reduce((sum: number, r: SleepRecord) => sum + r.sleepDuration, 0) / records.length;

    const recordsWithScore = records.filter((r: SleepRecord) => r.sleepScore !== null);
    const avgScore = recordsWithScore.length > 0
      ? records.reduce((sum: number, r: SleepRecord) => sum + (r.sleepScore || 0), 0) / recordsWithScore.length
      : 0;

    const prompt = `作为睡眠健康专家，请分析以下睡眠数据并生成报告：

数据概览：
- 记录天数：${records.length}天
- 平均睡眠时长：${avgDuration.toFixed(1)}小时
- 平均睡眠评分：${avgScore.toFixed(0)}分

详细数据：
${JSON.stringify(dataSummary, null, 2)}

请提供以下分析（用JSON格式返回）：
{
  "summary": "整体睡眠情况总结（100字以内）",
  "sleepQuality": "睡眠质量评价：优秀/良好/一般/较差",
  "suggestions": "3-5条改善睡眠的具体建议"
}`;

    const text = await generateSleepAnalysis(prompt);

    // Parse AI response with validation
    interface AIAnalysis {
      summary?: string;
      sleepQuality?: string;
      suggestions?: string | string[];
    }

    const validQualities = ["优秀", "良好", "一般", "较差"];
    const defaultAnalysis: AIAnalysis = {
      summary: "暂无分析结果",
      sleepQuality: "良好",
      suggestions: "建议保持规律作息",
    };

    let analysis: AIAnalysis;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("AI 响应未找到 JSON 格式，使用原始文本");
        analysis = {
          ...defaultAnalysis,
          summary: text.slice(0, 200),
        };
      } else {
        const parsed = JSON.parse(jsonMatch[0]);

        analysis = {
          summary: typeof parsed.summary === "string" ? parsed.summary : defaultAnalysis.summary,
          sleepQuality: validQualities.includes(parsed.sleepQuality)
            ? parsed.sleepQuality
            : defaultAnalysis.sleepQuality,
          suggestions: parsed.suggestions || defaultAnalysis.suggestions,
        };

        if (!parsed.summary) console.warn("AI 响应缺少 summary 字段");
        if (!parsed.sleepQuality) console.warn("AI 响应缺少 sleepQuality 字段");
        if (!parsed.suggestions) console.warn("AI 响应缺少 suggestions 字段");
      }
    } catch (parseError) {
      console.warn("AI 响应 JSON 解析失败:", parseError);
      analysis = {
        ...defaultAnalysis,
        summary: text.slice(0, 200),
      };
    }

    // Save report
    const report = await prisma.analysisReport.create({
      data: {
        title: `睡眠分析报告 - ${new Date().toLocaleDateString()}`,
        summary: analysis.summary || "",
        suggestions: Array.isArray(analysis.suggestions)
          ? analysis.suggestions.join("\n")
          : analysis.suggestions || "",
        sleepQuality: analysis.sleepQuality || "良好",
        dataRange: `${records[0].date.toLocaleDateString()} 至 ${records[records.length - 1].date.toLocaleDateString()}`,
        userId: user.userId,
      },
    });

    return NextResponse.json({ report, analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze data" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/analyze/route.ts
git commit -m "feat: 分析 API 支持日期区间参数"
```

---

### Task 3: 创建日期区间选择对话框组件

**Files:**
- Create: `src/components/date-range-dialog.tsx`

- [ ] **Step 1: 创建对话框组件**

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { format, differenceInDays, eachDayOfInterval, subDays } from "date-fns";
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
import { cn } from "@/lib/utils";

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
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "yyyy/MM/dd") : "开始日期"}
                </Button>
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
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, "yyyy/MM/dd") : "结束日期"}
                </Button>
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/date-range-dialog.tsx
git commit -m "feat: 创建日期区间选择对话框组件"
```

---

### Task 4: 修改 Dashboard 页面集成对话框

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: 添加导入和状态**

在文件顶部添加导入：

```typescript
import { DateRangeDialog } from "@/components/date-range-dialog";
```

在组件内添加状态（在 `const [analyzeProgress, setAnalyzeProgress] = useState("");` 后）：

```typescript
  const [dialogOpen, setDialogOpen] = useState(false);
```

- [ ] **Step 2: 修改 handleAnalyze 函数**

将现有的 `handleAnalyze` 函数修改为：

```typescript
  const handleAnalyze = async (startDate?: string, endDate?: string) => {
    setAnalyzing(true);
    setAnalyzeProgress("正在分析数据...");
    setDialogOpen(false);

    try {
      const res = await fetchWithTimeout(
        "/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate, endDate }),
        },
        FETCH_TIMEOUT
      );
      const data = await res.json();

      if (data.report) {
        setAnalyzeProgress("分析完成！");
        toast.success("报告生成成功");
        router.push(`/report/${data.report.id}`);
      } else {
        toast.error(data.error || "分析失败");
        setAnalyzing(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "分析失败，请重试";
      toast.error(message);
      setAnalyzing(false);
    }
  };
```

- [ ] **Step 3: 修改按钮点击事件**

将"生成 AI 报告"按钮的 `onClick` 从 `handleAnalyze` 改为：

```typescript
onClick={() => setDialogOpen(true)}
```

- [ ] **Step 4: 在组件末尾添加对话框**

在 `</div>` 结束标签前（main 之后）添加：

```typescript
      {/* Date Range Dialog */}
      <DateRangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={(startDate, endDate) => handleAnalyze(startDate, endDate)}
        loading={analyzing}
      />
```

- [ ] **Step 5: 提交**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: Dashboard 集成日期区间选择对话框"
```

---

### Task 5: 安装 Dialog 组件（如未安装）

**Files:**
- Check/Create: `src/components/ui/dialog.tsx`

- [ ] **Step 1: 检查并安装 Dialog 组件**

```bash
npx shadcn@latest add dialog -y
```

- [ ] **Step 2: 如已存在则跳过，否则提交**

```bash
git add src/components/ui/dialog.tsx
git commit -m "chore: 安装 shadcn Dialog 组件"
```

---

### Task 6: 验证功能

- [ ] **Step 1: 运行开发服务器测试**

```bash
npm run dev
```

- [ ] **Step 2: 手动测试验收标准**

1. 点击"生成 AI 报告"按钮，确认弹出对话框
2. 确认日历上正确标记有记录的日期
3. 确认默认选中最近连续有记录的区间
4. 选择不同区间，确认无记录天数提示正确
5. 确认生成的报告数据范围与选择区间一致
6. 确认取消按钮可以关闭对话框

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: 完成 AI 分析日期区间选择功能"
```
