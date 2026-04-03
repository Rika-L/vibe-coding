import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface UseEChartsOptions {
  option: echarts.EChartsOption;
  deps?: React.DependencyList; // 调用方控制依赖（不包含 isDark）
  onThemeChange?: (isDark: boolean) => echarts.EChartsOption;
}

export function useECharts({ option, deps = [], onThemeChange }: UseEChartsOptions) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 保持现有行为：不传 theme 参数
    chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      if (onThemeChange) {
        chartInstance.current?.setOption(onThemeChange(isDark));
      }
      chartInstance.current?.resize();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      chartInstance.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return chartRef;
}
