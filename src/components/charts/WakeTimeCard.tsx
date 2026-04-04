'use client';

import * as echarts from 'echarts';
import { Sun } from 'lucide-react';
import { useECharts } from '@/hooks';

interface WakeTimeCardProps {
  data: {
    date: string;
    wakeTime: string; // ISO time string
  }[];
}

export function WakeTimeCard({ data }: WakeTimeCardProps) {
  // Calculate average wake time
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

  // Convert to hours for chart
  const hoursData = data.map((d) => {
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
      min: 6, // 6 AM
      max: 18, // 6 PM (handle afternoon wake times)
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

  const chartRef = useECharts({
    option,
    deps: [data],
  });

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
