"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface SleepScoreGaugeProps {
  score: number;
}

export function SleepScoreGauge({ score }: SleepScoreGaugeProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = document.documentElement.classList.contains("dark");
    chartInstance.current = echarts.init(chartRef.current);

    const color = score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : "#ef4444";

    const option: echarts.EChartsOption = {
      title: {
        text: "睡眠评分",
        left: "center",
        top: "78%",
        textStyle: {
          fontSize: 14,
          color: isDark ? "#a1a1aa" : "#71717a",
        },
      },
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 5,
          radius: "90%",
          center: ["50%", "70%"],
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
              color: [[1, isDark ? "#27272a" : "#e4e4e7"]],
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
            fontWeight: "bold",
            offsetCenter: [0, "-5%"],
            formatter: "{value}",
            color: isDark ? "#fafafa" : "#18181b",
          },
          data: [{ value: score }],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();

    // Observer for theme changes
    const observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains("dark");
      chartInstance.current?.setOption({
        title: {
          textStyle: { color: newIsDark ? "#a1a1aa" : "#71717a" },
        },
        series: [
          {
            axisLine: {
              lineStyle: {
                color: [[1, newIsDark ? "#27272a" : "#e4e4e7"]],
              },
            },
            detail: { color: newIsDark ? "#fafafa" : "#18181b" },
          },
        ],
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [score]);

  return <div ref={chartRef} style={{ width: "100%", height: "220px" }} />;
}
