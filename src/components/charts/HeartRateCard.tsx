'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Heart } from 'lucide-react';

interface HeartRateCardProps {
  data: {
    date: string;
    heartRate: number | null | undefined;
  }[];
}

export function HeartRateCard({ data }: HeartRateCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Filter valid data and calculate average
  const validData = data.filter(d => d.heartRate !== null && d.heartRate !== undefined);
  const avgHeartRate = validData.length > 0
    ? Math.round(validData.reduce((sum, d) => sum + (d.heartRate || 0), 0) / validData.length)
    : 0;

  useEffect(() => {
    if (!chartRef.current || validData.length === 0) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      grid: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      xAxis: {
        type: 'category',
        data: validData.map(d => d.date),
        show: false,
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'line',
          data: validData.map(d => d.heartRate),
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
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
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [validData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-rose-500/10">
          <Heart className="h-4 w-4 text-rose-500" />
        </div>
        <span className="text-sm text-muted-foreground">平均心率</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-foreground">
          {validData.length > 0 ? avgHeartRate : '--'}
        </span>
        <span className="text-sm text-muted-foreground">bpm</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        {validData.length > 0
          ? `基于 ${validData.length} 天记录`
          : '暂无数据'}
      </div>
      <div ref={chartRef} className="flex-1 min-h-[60px]" />
    </div>
  );
}
