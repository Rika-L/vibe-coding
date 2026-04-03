'use client';

import * as echarts from 'echarts';
import { useECharts } from '@/hooks';

interface SleepStructureChartProps {
  data: {
    deep: number | null | undefined;
    light: number | null | undefined;
    rem: number | null | undefined;
  }[];
}

export function SleepStructureChart({ data }: SleepStructureChartProps) {
  const avgDeep = data.reduce((sum, d) => sum + (d.deep || 0), 0) / data.length;
  const avgLight = data.reduce((sum, d) => sum + (d.light || 0), 0) / data.length;
  const avgRem = data.reduce((sum, d) => sum + (d.rem || 0), 0) / data.length;

  const colors = ['#6366f1', '#a78bfa', '#e879f9'];

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}小时 ({d}%)',
    },
    legend: {
      bottom: 0,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderWidth: 3,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}h ({d}%)',
        },
        labelLine: {
          show: true,
        },
        data: [
          {
            value: Number(avgDeep.toFixed(1)),
            name: '深睡',
            itemStyle: { color: colors[0] },
          },
          {
            value: Number(avgLight.toFixed(1)),
            name: '浅睡',
            itemStyle: { color: colors[1] },
          },
          {
            value: Number(avgRem.toFixed(1)),
            name: 'REM',
            itemStyle: { color: colors[2] },
          },
        ],
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
      series: [
        {
          itemStyle: {
            borderColor: isDark ? '#27272a' : '#ffffff',
          },
          label: { color: isDark ? '#fafafa' : '#18181b' },
          labelLine: { lineStyle: { color: isDark ? '#52525b' : '#a1a1aa' } },
        },
      ],
    }),
  });

  return <div ref={chartRef} style={{ width: '100%', height: '320px' }} />;
}
