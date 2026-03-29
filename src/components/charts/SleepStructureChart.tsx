"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface SleepStructureChartProps {
  data: {
    deep?: number;
    light?: number;
    rem?: number;
  }[];
}

export function SleepStructureChart({ data }: SleepStructureChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const avgDeep = data.reduce((sum, d) => sum + (d.deep || 0), 0) / data.length;
    const avgLight = data.reduce((sum, d) => sum + (d.light || 0), 0) / data.length;
    const avgRem = data.reduce((sum, d) => sum + (d.rem || 0), 0) / data.length;

    const option: echarts.EChartsOption = {
      title: {
        text: "平均睡眠结构",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}小时 ({d}%)",
      },
      legend: {
        bottom: 0,
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{b}\n{c}h ({d}%)",
          },
          data: [
            { value: avgDeep.toFixed(1), name: "深睡", itemStyle: { color: "#5470c6" } },
            { value: avgLight.toFixed(1), name: "浅睡", itemStyle: { color: "#91cc75" } },
            { value: avgRem.toFixed(1), name: "REM", itemStyle: { color: "#fac858" } },
          ],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "350px" }} />;
}
