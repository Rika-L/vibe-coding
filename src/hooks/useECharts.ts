import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';

interface UseEChartsOptions {
  option: echarts.EChartsOption;
  deps?: React.DependencyList;
  onThemeChange?: (isDark: boolean) => echarts.EChartsOption;
}

export function useECharts({ option, deps = [], onThemeChange }: UseEChartsOptions) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const optionRef = useRef(option);

  // 保存最新配置
  optionRef.current = option;

  // 初始化图表实例 - 只执行一次
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption(optionRef.current);

    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  // 数据更新时使用 setOption 增量更新
  useEffect(() => {
    if (!chartInstance.current) return;
    chartInstance.current.setOption(option, true);
  }, deps);

  // 主题变化处理
  useEffect(() => {
    if (!chartRef.current || !onThemeChange) return;

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      chartInstance.current?.setOption(onThemeChange(isDark));
      chartInstance.current?.resize();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [onThemeChange]);

  // Resize 处理 - 使用防抖
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        chartInstance.current?.resize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return chartRef;
}
