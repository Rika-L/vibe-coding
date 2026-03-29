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

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: "睡眠评分",
        left: "center",
        top: "60%",
        textStyle: {
          fontSize: 16,
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
            color: score >= 80 ? "#91cc75" : score >= 60 ? "#fac858" : "#ee6666",
          },
          progress: {
            show: true,
            width: 20,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 20,
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            distance: 30,
            fontSize: 12,
          },
          detail: {
            valueAnimation: true,
            fontSize: 40,
            offsetCenter: [0, "-10%"],
            formatter: "{value}",
          },
          data: [{ value: score }],
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
  }, [score]);

  return <div ref={chartRef} style={{ width: "100%", height: "250px" }} />;
}
