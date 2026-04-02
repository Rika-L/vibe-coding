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
