'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface SleepStructureChartProps {
  data: {
    deep: number | null | undefined;
    light: number | null | undefined;
    rem: number | null | undefined;
  }[];
}

export function SleepStructureChart({ data }: SleepStructureChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    chartInstance.current = echarts.init(chartRef.current);

    const avgDeep = data.reduce((sum, d) => sum + (d.deep || 0), 0) / data.length;
    const avgLight = data.reduce((sum, d) => sum + (d.light || 0), 0) / data.length;
    const avgRem = data.reduce((sum, d) => sum + (d.rem || 0), 0) / data.length;

    const colors = ['#8b5cf6', '#22c55e', '#f59e0b'];

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}小时 ({d}%)',
        backgroundColor: isDark ? '#27272a' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        textStyle: {
          color: isDark ? '#fafafa' : '#18181b',
        },
      },
      legend: {
        bottom: 0,
        textStyle: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: isDark ? '#27272a' : '#ffffff',
            borderWidth: 3,
          },
          label: {
            show: true,
            formatter: '{b}\n{c}h ({d}%)',
            color: isDark ? '#fafafa' : '#18181b',
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: isDark ? '#52525b' : '#a1a1aa',
            },
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
        series: [
          {
            itemStyle: {
              borderColor: newIsDark ? '#27272a' : '#ffffff',
            },
            label: { color: newIsDark ? '#fafafa' : '#18181b' },
            labelLine: { lineStyle: { color: newIsDark ? '#52525b' : '#a1a1aa' } },
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

  return <div ref={chartRef} style={{ width: '100%', height: '320px' }} />;
}
