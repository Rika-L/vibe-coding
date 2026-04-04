'use client';

import * as echarts from 'echarts';
import { memo } from 'react';
import { useECharts } from '@/hooks';

interface SleepRegularityChartProps {
  data: {
    date: string;
    bedTime: string;
    wakeTime: string;
  }[];
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

export const SleepRegularityChart = memo(function SleepRegularityChart({ data }: SleepRegularityChartProps) {
  // Convert times to hours
  const scatterData = data.map((d) => {
    const bed = new Date(d.bedTime);
    const wake = new Date(d.wakeTime);
    let bedHour = bed.getHours() + bed.getMinutes() / 60;
    const wakeHour = wake.getHours() + wake.getMinutes() / 60;

    // Add 24 to early morning bedtimes for display
    if (bedHour < 6) bedHour += 24;

    return [bedHour, wakeHour, d.date];
  });

  // Calculate regularity score
  const bedTimes = scatterData.map(d => Number(d[0]));
  const wakeTimes = scatterData.map(d => Number(d[1]));
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
        color: '#71717a', // 默认颜色，适配浅色主题
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
      formatter: (params: unknown) => {
        const p = params as { data: number[] };
        const [bedHour, wakeHour, date] = p.data;
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
      axisLabel: {
        formatter: (value: number) => {
          const hour = value > 24 ? value - 24 : value;
          return `${Math.floor(hour).toString().padStart(2, '0')}:00`;
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '起床时间',
      min: 6,
      max: 18,
      axisLabel: {
        formatter: (value: number) => {
          return `${Math.floor(value).toString().padStart(2, '0')}:00`;
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

  const chartRef = useECharts({
    option,
    deps: [data],
    onThemeChange: isDark => ({
      title: {
        textStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
      },
      tooltip: {
        backgroundColor: isDark ? '#27272a' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        textStyle: { color: isDark ? '#fafafa' : '#18181b' },
      },
      xAxis: {
        nameTextStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
        axisLabel: { color: isDark ? '#a1a1aa' : '#71717a' },
        axisLine: { lineStyle: { color: isDark ? '#3f3f46' : '#e4e4e7' } },
        splitLine: { lineStyle: { color: isDark ? '#27272a' : '#f4f4f5' } },
      },
      yAxis: {
        nameTextStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
        axisLabel: { color: isDark ? '#a1a1aa' : '#71717a' },
        axisLine: { lineStyle: { color: isDark ? '#3f3f46' : '#e4e4e7' } },
        splitLine: { lineStyle: { color: isDark ? '#27272a' : '#f4f4f5' } },
      },
    }),
  });

  return <div ref={chartRef} style={{ width: '100%', height: '350px' }} />;
});
