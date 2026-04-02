'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface SleepTrendChartProps {
  data: {
    date: string;
    duration: number;
    score: number | null | undefined;
  }[];
}

export function SleepTrendChart({ data }: SleepTrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    chartInstance.current = echarts.init(chartRef.current);

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
        backgroundColor: isDark ? '#27272a' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        textStyle: {
          color: isDark ? '#fafafa' : '#18181b',
        },
      },
      legend: {
        data: ['睡眠时长', '睡眠评分'],
        bottom: 0,
        textStyle: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date),
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
      yAxis: [
        {
          type: 'value',
          name: '时长(小时)',
          min: 0,
          max: 12,
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
        {
          type: 'value',
          name: '评分',
          min: 0,
          max: 100,
          nameTextStyle: {
            color: isDark ? '#a1a1aa' : '#71717a',
          },
          axisLabel: {
            color: isDark ? '#a1a1aa' : '#71717a',
          },
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
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: primaryColor },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${primaryColor}40` },
              { offset: 1, color: `${primaryColor}05` },
            ]),
          },
        },
        {
          name: '睡眠评分',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => d.score),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: secondaryColor },
          lineStyle: { width: 3 },
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
        legend: {
          textStyle: { color: newIsDark ? '#a1a1aa' : '#71717a' },
        },
        xAxis: {
          axisLabel: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          axisLine: { lineStyle: { color: newIsDark ? '#3f3f46' : '#e4e4e7' } },
        },
        yAxis: [
          {
            nameTextStyle: { color: newIsDark ? '#a1a1aa' : '#71717a' },
            axisLabel: { color: newIsDark ? '#a1a1aa' : '#71717a' },
            splitLine: { lineStyle: { color: newIsDark ? '#27272a' : '#f4f4f5' } },
          },
          {
            nameTextStyle: { color: newIsDark ? '#a1a1aa' : '#71717a' },
            axisLabel: { color: newIsDark ? '#a1a1aa' : '#71717a' },
          },
        ],
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
