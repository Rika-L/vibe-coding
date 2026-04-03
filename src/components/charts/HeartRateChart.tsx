'use client';

import * as echarts from 'echarts';
import { useECharts } from '@/hooks';

interface HeartRateChartProps {
  data: {
    date: string;
    heartRate: number | null | undefined;
  }[];
}

export function HeartRateChart({ data }: HeartRateChartProps) {
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
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number }[];
        return `${p[0].name}<br/>心率: <b>${p[0].value} bpm</b>`;
      },
    },
    xAxis: {
      type: 'category',
      data: validData.map(d => d.date),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '心率 (bpm)',
      min: 40,
      max: 120,
    },
    series: [
      {
        name: '心率',
        type: 'line',
        data: validData.map(d => d.heartRate),
        smooth: true,
        sampling: 'lttb',
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

  const chartRef = useECharts({
    option,
    deps: [data],
    onThemeChange: isDark => ({
      tooltip: {
        backgroundColor: isDark ? '#27272a' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        textStyle: { color: isDark ? '#fafafa' : '#18181b' },
      },
      xAxis: {
        axisLabel: { color: isDark ? '#a1a1aa' : '#71717a' },
        axisLine: { lineStyle: { color: isDark ? '#3f3f46' : '#e4e4e7' } },
      },
      yAxis: {
        nameTextStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
        axisLabel: { color: isDark ? '#a1a1aa' : '#71717a' },
        splitLine: { lineStyle: { color: isDark ? '#27272a' : '#f4f4f5' } },
      },
    }),
  });

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
}
