'use client';

import * as echarts from 'echarts';
import { useECharts } from '@/hooks';

interface SleepScoreGaugeProps {
  score: number;
}

export function SleepScoreGauge({ score }: SleepScoreGaugeProps) {
  const color = score >= 80
    ? '#10b981' // emerald green - excellent
    : score >= 60
      ? '#06b6d4' // cyan - good
      : '#f43f5e'; // rose red - needs improvement

  const option: echarts.EChartsOption = {
    title: {
      text: '睡眠评分',
      left: 'center',
      top: '78%',
      textStyle: {
        fontSize: 14,
        color: '#a1a1aa',
      },
    },
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '90%',
        center: ['50%', '70%'],
        itemStyle: {
          color: color,
        },
        progress: {
          show: true,
          width: 16,
          roundCap: true,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 16,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          fontSize: 48,
          fontWeight: 'bold',
          offsetCenter: [0, '-5%'],
          formatter: '{value}',
          color: '#fafafa',
        },
        data: [{ value: score }],
      },
    ],
  };

  const chartRef = useECharts({
    option,
    deps: [score],
    onThemeChange: isDark => ({
      title: {
        textStyle: { color: isDark ? '#a1a1aa' : '#71717a' },
      },
      series: [
        {
          axisLine: {
            lineStyle: {
              color: [[1, isDark ? '#27272a' : '#e4e4e7']],
            },
          },
          detail: {
            color: isDark ? '#fafafa' : '#18181b',
          },
        } as echarts.SeriesOption,
      ],
    }),
  });

  return <div ref={chartRef} style={{ width: '100%', height: '220px' }} />;
}
