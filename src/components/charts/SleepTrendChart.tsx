"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface SleepTrendChartProps {
  data: {
    date: string;
    duration: number;
    score?: number;
  }[];
}

export function SleepTrendChart({ data }: SleepTrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: "睡眠趋势",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["睡眠时长", "睡眠评分"],
        bottom: 0,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.date),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "时长(小时)",
          min: 0,
          max: 12,
        },
        {
          type: "value",
          name: "评分",
          min: 0,
          max: 100,
        },
      ],
      series: [
        {
          name: "睡眠时长",
          type: "line",
          data: data.map((d) => d.duration.toFixed(1)),
          smooth: true,
          itemStyle: { color: "#5470c6" },
        },
        {
          name: "睡眠评分",
          type: "line",
          yAxisIndex: 1,
          data: data.map((d) => d.score),
          smooth: true,
          itemStyle: { color: "#91cc75" },
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

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
}
