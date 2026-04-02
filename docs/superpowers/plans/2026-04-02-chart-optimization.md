# 图表优化与新增 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化现有图表样式（Apple Health 风格配色），新增就寝时间、起床时间、心率图表

**Architecture:** 保持现有 ECharts 组件架构，新增 3 个统计卡片组件和 2 个图表组件，统一使用新的 Apple Health 风格配色系统

**Tech Stack:** React, TypeScript, ECharts, Tailwind CSS, shadcn/ui

---

## File Structure

| 文件 | 用途 |
|------|------|
| `src/components/charts/SleepTrendChart.tsx` | 修改：更新配色为 Apple Health 风格 |
| `src/components/charts/SleepStructureChart.tsx` | 修改：更新配色为 Apple Health 风格 |
| `src/components/charts/SleepScoreGauge.tsx` | 修改：更新配色为 Apple Health 风格 |
| `src/components/charts/BedTimeCard.tsx` | 新建：平均就寝时间卡片 + 迷你趋势 |
| `src/components/charts/WakeTimeCard.tsx` | 新建：平均起床时间卡片 + 迷你趋势 |
| `src/components/charts/HeartRateCard.tsx` | 新建：平均心率卡片 + 迷你趋势 |
| `src/components/charts/HeartRateChart.tsx` | 新建：心率趋势面积图 |
| `src/components/charts/SleepRegularityChart.tsx` | 新建：睡眠规律散点图 |
| `src/components/charts/index.ts` | 修改：导出新增组件 |
| `src/app/dashboard/page.tsx` | 修改：整合新图表到布局 |

---

## Apple Health 配色系统

```typescript
// 主色调
const colors = {
  deepSleep: '#6366f1',    // 深紫 - 深睡
  lightSleep: '#a78bfa',   // 浅紫 - 浅睡
  remSleep: '#e879f9',     // 粉紫 - REM
  sleepDuration: '#0ea5e9', // 天蓝 - 睡眠时长
  sleepScore: '#06b6d4',   // 青色 - 睡眠评分
  heartRate: '#f43f5e',    // 玫瑰红 - 心率
  bedTime: '#6366f1',      // 靛蓝 - 就寝时间
  wakeTime: '#f59e0b',     // 琥珀 - 起床时间
};

// 渐变配置
const gradients = {
  deepSleep: ['#818cf8', '#6366f1'],
  lightSleep: ['#c4b5fd', '#a78bfa'],
  remSleep: ['#f0abfc', '#e879f9'],
  sleepDuration: ['#38bdf8', '#0ea5e9'],
  sleepScore: ['#22d3ee', '#06b6d4'],
  heartRate: ['#fb7185', '#f43f5e'],
};
```

---

## Task 1: 更新 SleepTrendChart 配色

**Files:**
- Modify: `src/components/charts/SleepTrendChart.tsx`

- [x] **Step 1: 更新颜色配置**

将文件中的颜色常量替换为 Apple Health 风格：

```typescript
// 替换前
const primaryColor = '#8b5cf6';
const secondaryColor = '#22c55e';

// 替换后
const primaryColor = '#0ea5e9'; // 天蓝 - 睡眠时长
const secondaryColor = '#06b6d4'; // 青色 - 睡眠评分
```

- [x] **Step 2: 更新面积图渐变**

```typescript
areaStyle: {
  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(14, 165, 233, 0.3)' },
    { offset: 1, color: 'rgba(14, 165, 233, 0.02)' },
  ]),
},
```

- [x] **Step 3: 提交**

```bash
git add src/components/charts/SleepTrendChart.tsx
git commit -m "style: 更新睡眠趋势图为 Apple Health 风格配色"
```

---

## Task 2: 更新 SleepStructureChart 配色

**Files:**
- Modify: `src/components/charts/SleepStructureChart.tsx`

- [x] **Step 1: 更新颜色数组**

```typescript
// 替换前
const colors = ['#8b5cf6', '#22c55e', '#f59e0b'];

// 替换后
const colors = ['#6366f1', '#a78bfa', '#e879f9']; // 深紫、浅紫、粉紫
```

- [x] **Step 2: 提交**

```bash
git add src/components/charts/SleepStructureChart.tsx
git commit -m "style: 更新睡眠结构图为 Apple Health 风格配色"
```

---

## Task 3: 更新 SleepScoreGauge 配色

**Files:**
- Modify: `src/components/charts/SleepScoreGauge.tsx`

- [x] **Step 1: 更新评分颜色逻辑**

```typescript
// 替换前
const color = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : '#ef4444';

// 替换后
const color = score >= 80
  ? '#10b981' // 翠绿 - 优秀
  : score >= 60
    ? '#06b6d4' // 青色 - 良好
    : '#f43f5e'; // 玫瑰红 - 需改善
```

- [ ] **Step 2: 提交**

```bash
git add src/components/charts/SleepScoreGauge.tsx
git commit -m "style: 更新睡眠评分仪表盘为 Apple Health 风格配色"
```

---

## Task 4: 创建 BedTimeCard 组件

**Files:**
- Create: `src/components/charts/BedTimeCard.tsx`

- [ ] **Step 1: 创建组件文件**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Moon } from 'lucide-react';

interface BedTimeCardProps {
  data: {
    date: string;
    bedTime: string; // ISO 时间字符串
  }[];
}

export function BedTimeCard({ data }: BedTimeCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 计算平均就寝时间
  const avgBedTime = data.length > 0
    ? data.reduce((sum, d) => {
        const date = new Date(d.bedTime);
        const hours = date.getHours() + date.getMinutes() / 60;
        return sum + hours;
      }, 0) / data.length
    : 0;

  const avgHours = Math.floor(avgBedTime);
  const avgMinutes = Math.round((avgBedTime - avgHours) * 60);
  const timeString = `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`;

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    chartInstance.current = echarts.init(chartRef.current);
    const isDark = document.documentElement.classList.contains('dark');

    // 转换为小时数用于图表
    const hoursData = data.map(d => {
      const date = new Date(d.bedTime);
      return date.getHours() + date.getMinutes() / 60;
    });

    const option: echarts.EChartsOption = {
      grid: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date),
        show: false,
      },
      yAxis: {
        type: 'value',
        min: 18, // 晚上6点
        max: 30, // 凌晨6点（24+6）
        show: false,
      },
      series: [
        {
          type: 'line',
          data: hoursData.map(h => h < 12 ? h + 24 : h), // 凌晨时间加24
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: '#6366f1',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.02)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10">
          <Moon className="h-4 w-4 text-indigo-500" />
        </div>
        <span className="text-sm text-muted-foreground">平均就寝</span>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">
        {data.length > 0 ? timeString : '--:--'}
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        {data.length > 0 ? '基于 ' + data.length + ' 天记录' : '暂无数据'}
      </div>
      <div ref={chartRef} className="flex-1 min-h-[60px]" />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/charts/BedTimeCard.tsx
git commit -m "feat: 添加平均就寝时间卡片组件"
```

---

## Task 5: 创建 WakeTimeCard 组件

**Files:**
- Create: `src/components/charts/WakeTimeCard.tsx`

- [ ] **Step 1: 创建组件文件**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Sun } from 'lucide-react';

interface WakeTimeCardProps {
  data: {
    date: string;
    wakeTime: string; // ISO 时间字符串
  }[];
}

export function WakeTimeCard({ data }: WakeTimeCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 计算平均起床时间
  const avgWakeTime = data.length > 0
    ? data.reduce((sum, d) => {
        const date = new Date(d.wakeTime);
        const hours = date.getHours() + date.getMinutes() / 60;
        return sum + hours;
      }, 0) / data.length
    : 0;

  const avgHours = Math.floor(avgWakeTime);
  const avgMinutes = Math.round((avgWakeTime - avgHours) * 60);
  const timeString = `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`;

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    chartInstance.current = echarts.init(chartRef.current);
    const isDark = document.documentElement.classList.contains('dark');

    // 转换为小时数用于图表
    const hoursData = data.map(d => {
      const date = new Date(d.wakeTime);
      return date.getHours() + date.getMinutes() / 60;
    });

    const option: echarts.EChartsOption = {
      grid: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date),
        show: false,
      },
      yAxis: {
        type: 'value',
        min: 4,  // 凌晨4点
        max: 12, // 中午12点
        show: false,
      },
      series: [
        {
          type: 'line',
          data: hoursData,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: '#f59e0b',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.02)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Sun className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-sm text-muted-foreground">平均起床</span>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">
        {data.length > 0 ? timeString : '--:--'}
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        {data.length > 0 ? '基于 ' + data.length + ' 天记录' : '暂无数据'}
      </div>
      <div ref={chartRef} className="flex-1 min-h-[60px]" />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/charts/WakeTimeCard.tsx
git commit -m "feat: 添加平均起床时间卡片组件"
```

---

## Task 6: 创建 HeartRateCard 组件

**Files:**
- Create: `src/components/charts/HeartRateCard.tsx`

- [ ] **Step 1: 创建组件文件**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Heart } from 'lucide-react';

interface HeartRateCardProps {
  data: {
    date: string;
    heartRate: number | null | undefined;
  }[];
}

export function HeartRateCard({ data }: HeartRateCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 过滤有效数据并计算平均值
  const validData = data.filter(d => d.heartRate !== null && d.heartRate !== undefined);
  const avgHeartRate = validData.length > 0
    ? Math.round(validData.reduce((sum, d) => sum + (d.heartRate || 0), 0) / validData.length)
    : 0;

  useEffect(() => {
    if (!chartRef.current || validData.length === 0) return;

    chartInstance.current = echarts.init(chartRef.current);
    const isDark = document.documentElement.classList.contains('dark');

    const option: echarts.EChartsOption = {
      grid: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      xAxis: {
        type: 'category',
        data: validData.map(d => d.date),
        show: false,
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'line',
          data: validData.map(d => d.heartRate),
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: '#f43f5e',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(244, 63, 94, 0.3)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0.02)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [validData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-rose-500/10">
          <Heart className="h-4 w-4 text-rose-500" />
        </div>
        <span className="text-sm text-muted-foreground">平均心率</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-foreground">
          {validData.length > 0 ? avgHeartRate : '--'}
        </span>
        <span className="text-sm text-muted-foreground">bpm</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        {validData.length > 0
          ? `基于 ${validData.length} 天记录`
          : '暂无数据'}
      </div>
      <div ref={chartRef} className="flex-1 min-h-[60px]" />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/charts/HeartRateCard.tsx
git commit -m "feat: 添加平均心率卡片组件"
```

---

## Task 7: 创建 HeartRateChart 组件

**Files:**
- Create: `src/components/charts/HeartRateChart.tsx`

- [ ] **Step 1: 创建组件文件**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface HeartRateChartProps {
  data: {
    date: string;
    heartRate: number | null | undefined;
  }[];
}

export function HeartRateChart({ data }: HeartRateChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    chartInstance.current = echarts.init(chartRef.current);

    const validData = data.filter(d => d.heartRate !== null && d.heartRate !== undefined);

    const option: echarts.EChartsOption = {
      grid: {
        top: 40,
        right: 30,
        bottom: 60,
        left: 50,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#27272a' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        textStyle: {
          color: isDark ? '#fafafa' : '#18181b',
        },
        formatter: (params: any) => {
          const p = params[0];
          return `${p.name}<br/>心率: <b>${p.value} bpm</b>`;
        },
      },
      xAxis: {
        type: 'category',
        data: validData.map(d => d.date),
        axisLabel: {
          rotate: 45,
          color: isDark ? '#a1a1aa' : '#71717a',
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#3f3f46' : '#e4e4e7',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '心率 (bpm)',
        min: 40,
        max: 120,
        nameTextStyle: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
        axisLabel: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#27272a' : '#f4f4f5',
          },
        },
      },
      series: [
        {
          name: '心率',
          type: 'line',
          data: validData.map(d => d.heartRate),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#f43f5e',
          },
          lineStyle: {
            width: 3,
            color: '#f43f5e',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(244, 63, 94, 0.3)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0.02)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();

    // Observer for theme changes
    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark');
      chartInstance.current?.setOption({
        tooltip: {
          backgroundColor: newIsDark ? '#27272a' : '#ffffff',
          borderColor: newIsDark ? '#3f3f46' : '#e4e4e7',
          textStyle: { color: newIsDark ? '#fafafa' : '#18181b' },
        },
        xAxis: {
          axisLabel: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          axisLine: { lineStyle: { color: newIsDark ? '#3f3f46' : '#e4e4e7' } },
        },
        yAxis: {
          nameTextStyle: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          axisLabel: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          splitLine: { lineStyle: { color: newIsDark ? '#27272a' : '#f4f4f5' } },
        },
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/charts/HeartRateChart.tsx
git commit -m "feat: 添加心率趋势面积图组件"
```

---

## Task 8: 创建 SleepRegularityChart 组件

**Files:**
- Create: `src/components/charts/SleepRegularityChart.tsx`

- [ ] **Step 1: 创建组件文件**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface SleepRegularityChartProps {
  data: {
    date: string;
    bedTime: string;
    wakeTime: string;
  }[];
}

export function SleepRegularityChart({ data }: SleepRegularityChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    chartInstance.current = echarts.init(chartRef.current);

    // 转换时间为小时数
    const scatterData = data.map(d => {
      const bed = new Date(d.bedTime);
      const wake = new Date(d.wakeTime);
      let bedHour = bed.getHours() + bed.getMinutes() / 60;
      let wakeHour = wake.getHours() + wake.getMinutes() / 60;

      // 凌晨时间就寝的加24小时便于显示
      if (bedHour < 6) bedHour += 24;

      return [bedHour, wakeHour, d.date];
    });

    // 计算规律性得分
    const bedTimes = scatterData.map(d => d[0]);
    const wakeTimes = scatterData.map(d => d[1]);
    const bedStd = calculateStd(bedTimes);
    const wakeStd = calculateStd(wakeTimes);
    const regularityScore = Math.max(0, 100 - (bedStd + wakeStd) * 10);

    const option: echarts.EChartsOption = {
      title: {
        text: `规律性评分: ${Math.round(regularityScore)}`,
        right: 10,
        top: 10,
        textStyle: {
          fontSize: 14,
          color: isDark ? '#a1a1aa' : '#71717a',
        },
      },
      grid: {
        top: 50,
        right: 30,
        bottom: 60,
        left: 70,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#27272a' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        textStyle: {
          color: isDark ? '#fafafa' : '#18181b',
        },
        formatter: (params: any) => {
          const [bedHour, wakeHour, date] = params.data;
          const bedTime = formatTime(bedHour > 24 ? bedHour - 24 : bedHour);
          const wakeTime = formatTime(wakeHour);
          return `${date}<br/>就寝: <b>${bedTime}</b><br/>起床: <b>${wakeTime}</b>`;
        },
      },
      xAxis: {
        type: 'value',
        name: '就寝时间',
        min: 18,
        max: 30,
        nameTextStyle: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
        axisLabel: {
          color: isDark ? '#a1a1aa' : '#71717a',
          formatter: (value: number) => {
            const hour = value > 24 ? value - 24 : value;
            return `${Math.floor(hour).toString().padStart(2, '0')}:00`;
          },
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#3f3f46' : '#e4e4e7',
          },
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#27272a' : '#f4f4f5',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '起床时间',
        min: 4,
        max: 12,
        nameTextStyle: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
        axisLabel: {
          color: isDark ? '#a1a1aa' : '#71717a',
          formatter: (value: number) => {
            return `${Math.floor(value).toString().padStart(2, '0')}:00`;
          },
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#3f3f46' : '#e4e4e7',
          },
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#27272a' : '#f4f4f5',
          },
        },
      },
      series: [
        {
          type: 'scatter',
          data: scatterData,
          symbolSize: 12,
          itemStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
              { offset: 0, color: '#818cf8' },
              { offset: 1, color: '#6366f1' },
            ]),
            shadowBlur: 10,
            shadowColor: 'rgba(99, 102, 241, 0.3)',
          },
          markArea: {
            silent: true,
            itemStyle: {
              color: 'rgba(99, 102, 241, 0.05)',
            },
            data: [
              [
                {
                  xAxis: 21,
                  yAxis: 6,
                },
                {
                  xAxis: 24,
                  yAxis: 9,
                },
              ],
            ],
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();

    // Observer for theme changes
    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark');
      chartInstance.current?.setOption({
        title: {
          textStyle: { color: newIsDark ? '#a1a1aa' : '#71717a' },
        },
        tooltip: {
          backgroundColor: newIsDark ? '#27272a' : '#ffffff',
          borderColor: newIsDark ? '#3f3f46' : '#e4e4e7',
          textStyle: { color: newIsDark ? '#fafafa' : '#18181b' },
        },
        xAxis: {
          nameTextStyle: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          axisLabel: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          axisLine: { lineStyle: { color: newIsDark ? '#3f3f46' : '#e4e4e7' } },
          splitLine: { lineStyle: { color: newIsDark ? '#27272a' : '#f4f4f5' } },
        },
        yAxis: {
          nameTextStyle: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          axisLabel: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          axisLine: { lineStyle: { color: newIsDark ? '#3f3f46' : '#e4e4e7' } },
          splitLine: { lineStyle: { color: newIsDark ? '#27272a' : '#f4f4f5' } },
        },
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '350px' }} />;
}

function calculateStd(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/charts/SleepRegularityChart.tsx
git commit -m "feat: 添加睡眠规律散点图组件"
```

---

## Task 9: 更新图表索引文件

**Files:**
- Modify: `src/components/charts/index.ts`

- [ ] **Step 1: 添加新组件导出**

```typescript
export { SleepTrendChart } from './SleepTrendChart';
export { SleepStructureChart } from './SleepStructureChart';
export { SleepScoreGauge } from './SleepScoreGauge';
export { BedTimeCard } from './BedTimeCard';
export { WakeTimeCard } from './WakeTimeCard';
export { HeartRateCard } from './HeartRateCard';
export { HeartRateChart } from './HeartRateChart';
export { SleepRegularityChart } from './SleepRegularityChart';
```

- [ ] **Step 2: 提交**

```bash
git add src/components/charts/index.ts
git commit -m "refactor: 更新图表组件索引，导出新增组件"
```

---

## Task 10: 更新 Dashboard 页面布局

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: 导入新组件**

在 imports 中添加：

```typescript
import {
  SleepTrendChart,
  SleepStructureChart,
  SleepScoreGauge,
  BedTimeCard,
  WakeTimeCard,
  HeartRateCard,
  HeartRateChart,
  SleepRegularityChart,
} from '@/components/charts';
```

- [ ] **Step 2: 准备新图表数据**

在 `chartData` 和 `structureData` 之后添加：

```typescript
const bedTimeData = records.map(r => ({
  date: new Date(r.date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  }),
  bedTime: r.bedTime,
}));

const wakeTimeData = records.map(r => ({
  date: new Date(r.date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  }),
  wakeTime: r.wakeTime,
}));

const heartRateData = records.map(r => ({
  date: new Date(r.date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  }),
  heartRate: r.heartRate,
}));

const regularityData = records.map(r => ({
  date: new Date(r.date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  }),
  bedTime: r.bedTime,
  wakeTime: r.wakeTime,
}));
```

- [ ] **Step 3: 更新 Stats Grid 区域**

将原有的 4 列统计卡片替换为新的布局：

```typescript
{/* Stats Grid - 新的 4 列布局 */}
<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
  {/* 睡眠评分 - 保持 */}
  <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
    <CardContent className="p-4">
      <SleepScoreGauge score={Math.round(avgScore)} />
    </CardContent>
  </Card>

  {/* 平均就寝时间 */}
  <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
    <CardContent className="p-4">
      <BedTimeCard data={bedTimeData} />
    </CardContent>
  </Card>

  {/* 平均起床时间 */}
  <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
    <CardContent className="p-4">
      <WakeTimeCard data={wakeTimeData} />
    </CardContent>
  </Card>

  {/* 平均心率 */}
  <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5">
    <CardContent className="p-4">
      <HeartRateCard data={heartRateData} />
    </CardContent>
  </Card>
</div>
```

- [ ] **Step 4: 更新 Charts Grid 区域**

将原有的图表区域替换为新的布局：

```typescript
{/* Charts Grid */}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {/* 睡眠趋势图 */}
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium">睡眠趋势</CardTitle>
    </CardHeader>
    <CardContent>
      <SleepTrendChart data={chartData} />
    </CardContent>
  </Card>

  {/* 睡眠结构图 */}
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium">平均睡眠结构</CardTitle>
    </CardHeader>
    <CardContent>
      <SleepStructureChart data={structureData} />
    </CardContent>
  </Card>

  {/* 心率趋势图 */}
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium">心率趋势</CardTitle>
    </CardHeader>
    <CardContent>
      <HeartRateChart data={heartRateData} />
    </CardContent>
  </Card>

  {/* 睡眠规律图 */}
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium">睡眠规律</CardTitle>
    </CardHeader>
    <CardContent>
      <SleepRegularityChart data={regularityData} />
    </CardContent>
  </Card>
</div>
```

- [ ] **Step 5: 删除旧的 StatCard 组件（如果不再需要）**

如果 `StatCard` 组件不再被使用，可以从文件底部删除它。

- [ ] **Step 6: 提交**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: 更新 Dashboard 布局，整合新图表组件"
```

---

## Task 11: 验证和测试

**Files:**
- All modified files

- [ ] **Step 1: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 2: 运行 lint 检查**

```bash
npm run lint
```

Expected: No lint errors

- [ ] **Step 3: 构建测试**

```bash
npm run build
```

Expected: Build successful

- [ ] **Step 4: 提交**

```bash
git commit -m "chore: 图表优化完成，通过类型检查和构建"
```

---

## Summary

完成此计划后，Dashboard 将拥有：

1. **Apple Health 风格配色** - 柔和渐变、现代感
2. **4 个顶部统计卡片** - 睡眠评分、就寝时间、起床时间、心率
3. **4 个主图表** - 睡眠趋势、睡眠结构、心率趋势、睡眠规律
4. **响应式布局** - 适配各种屏幕尺寸
5. **深色模式支持** - 所有图表适配 dark mode
