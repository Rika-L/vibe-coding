import { useMemo } from 'react';
import type { SleepRecord } from '@/lib/types';

interface ChartDataPoint {
  date: string;
  duration: number;
  score: number | null;
}

interface StructureDataPoint {
  deep: number | null;
  light: number | null;
  rem: number | null;
}

interface TimeDataPoint {
  date: string;
  bedTime: string;
}

interface WakeTimeDataPoint {
  date: string;
  wakeTime: string;
}

interface HeartRateDataPoint {
  date: string;
  heartRate: number;
}

interface RegularityDataPoint {
  date: string;
  bedTime: string;
  wakeTime: string;
}

export function useChartData(records: SleepRecord[]) {
  const chartData = useMemo<ChartDataPoint[]>(() =>
    records.map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
      duration: r.sleepDuration,
      score: r.sleepScore ?? null,
    })),
  [records]);

  const structureData = useMemo<StructureDataPoint[]>(() =>
    records.map(r => ({
      deep: r.deepSleep ?? null,
      light: r.lightSleep ?? null,
      rem: r.remSleep ?? null,
    })),
  [records]);

  const bedTimeData = useMemo<TimeDataPoint[]>(() =>
    records
      .filter(r => r.bedTime !== null)
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        }),
        bedTime: r.bedTime!,
      })),
  [records]);

  const wakeTimeData = useMemo<WakeTimeDataPoint[]>(() =>
    records
      .filter(r => r.wakeTime !== null)
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        }),
        wakeTime: r.wakeTime!,
      })),
  [records]);

  const heartRateData = useMemo<HeartRateDataPoint[]>(() =>
    records
      .filter(r => r.heartRate !== null)
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        }),
        heartRate: r.heartRate!,
      })),
  [records]);

  const regularityData = useMemo<RegularityDataPoint[]>(() =>
    records
      .filter(r => r.bedTime !== null && r.wakeTime !== null)
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        }),
        bedTime: r.bedTime!,
        wakeTime: r.wakeTime!,
      })),
  [records]);

  const avgScore = useMemo(() => {
    const recordsWithScore = records.filter(r => r.sleepScore !== null);
    if (recordsWithScore.length === 0) return 0;
    return records.reduce((sum, r) => sum + (r.sleepScore || 0), 0) / recordsWithScore.length;
  }, [records]);

  return {
    chartData,
    structureData,
    bedTimeData,
    wakeTimeData,
    heartRateData,
    regularityData,
    avgScore,
  };
}
