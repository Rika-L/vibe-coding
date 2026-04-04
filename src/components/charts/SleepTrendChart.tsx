'use client';

import * as echarts from 'echarts';
import { memo } from 'react';
import { useECharts } from '@/hooks';

interface SleepTrendChartProps {
  data: {
    date: string;
    duration: number;
    score: number | null | undefined;
  }[];
}

export const SleepTrendChart = memo(function SleepTrendChart({ data }: SleepTrendChartProps) {
  const primaryColor = '#0ea5e9';
  const secondaryColor = '#06b6d4';

  const option: echarts.EChartsOption = {
    grid: {
      top: 40,
      right: 60,
      bottom: 60,
      left: 50,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['睡眠时长', '睡眠评分'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '时长(小时)',
        min: 0,
        max: 12,
      },
      {
        type: 'value',
        name: '评分',
        min: 0,
        max: 100,
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '睡眠时长',
        type: 'line',
        data: data.map(d => d.duration.toFixed(1)),
        smooth: true,
        sampling: 'lttb',
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: primaryColor },
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(14, 165, 233, 0.3)' },
            { offset: 1, color: 'rgba(14, 165, 233, 0.02)' },
          ]),
        },
      },
      {
        name: '睡眠评分',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => d.score),
        smooth: true,
        sampling: 'lttb',
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: secondaryColor },
        lineStyle: { width: 3 },
      },
    ],
  };

  const chartRef = useECharts({
    option,
    deps: [data],
    onThemeChange: isDark => ({
      tooltip: {
        backgroundColor: isDark ? '#27272a' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        textStyle: { color: isDark ? '#fafafa' : '#18181b' },
      },
      legend: {
        textStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
      },
      xAxis: {
        axisLabel: { color: isDark ? '#a1a1aa' : '#71717a' },
        axisLine: { lineStyle: { color: isDark ? '#3f3f46' : '#e4e4e7' } },
      },
      yAxis: [
        {
          nameTextStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
          axisLabel: { color: isDark ? '#a1a1aa' : '#71717a' },
          splitLine: { lineStyle: { color: isDark ? '#27272a' : '#f4f4f5' } },
        },
        {
          nameTextStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
          axisLabel: { color: isDark ? '#a1a1aa' : '#71717a' },
        },
      ],
    }),
  });

  return <div ref={chartRef} style={{ width: '100%', height: '350px' }} />;
});
