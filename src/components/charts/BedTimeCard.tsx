'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Moon } from 'lucide-react';

interface BedTimeCardProps {
  data: {
    date: string;
    bedTime: string; // ISO time string
  }[];
}

export function BedTimeCard({ data }: BedTimeCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Calculate average bedtime
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

    // Convert to hours for chart
    const hoursData = data.map((d) => {
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
        min: 18, // 6 PM
        max: 30, // 6 AM next day (24+6)
        show: false,
      },
      series: [
        {
          type: 'line',
          data: hoursData.map(h => h < 12 ? h + 24 : h), // Early morning times add 24
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
