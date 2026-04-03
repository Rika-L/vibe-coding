import type { SleepRecord } from '@/lib/types';

export interface ChartDataPoint {
  date: string;
  duration: number;
  score: number | null;
}

export interface StructureDataPoint {
  deep: number | null;
  light: number | null;
  rem: number | null;
}

export interface BedTimeDataPoint {
  date: string;
  bedTime: string;
}

export interface WakeTimeDataPoint {
  date: string;
  wakeTime: string;
}

export interface HeartRateDataPoint {
  date: string;
  heartRate: number;
}

export interface RegularityDataPoint {
  date: string;
  bedTime: string;
  wakeTime: string;
}

export function computeChartData(records: SleepRecord[]) {
  const recordsWithScore = records.filter(r => r.sleepScore !== null);
  const avgScore = recordsWithScore.length > 0
    ? records.reduce((sum, r) => sum + (r.sleepScore || 0), 0) / recordsWithScore.length
    : 0;

  const chartData: ChartDataPoint[] = records.map(r => ({
    date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    duration: r.sleepDuration,
    score: r.sleepScore ?? null,
  }));

  const structureData: StructureDataPoint[] = records.map(r => ({
    deep: r.deepSleep ?? null,
    light: r.lightSleep ?? null,
    rem: r.remSleep ?? null,
  }));

  const bedTimeData: BedTimeDataPoint[] = records
    .filter(r => r.bedTime !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      bedTime: r.bedTime!,
    }));

  const wakeTimeData: WakeTimeDataPoint[] = records
    .filter(r => r.wakeTime !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      wakeTime: r.wakeTime!,
    }));

  const heartRateData: HeartRateDataPoint[] = records
    .filter(r => r.heartRate !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      heartRate: r.heartRate!,
    }));

  const regularityData: RegularityDataPoint[] = records
    .filter(r => r.bedTime !== null && r.wakeTime !== null)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      bedTime: r.bedTime!,
      wakeTime: r.wakeTime!,
    }));

  return {
    avgScore,
    chartData,
    structureData,
    bedTimeData,
    wakeTimeData,
    heartRateData,
    regularityData,
  };
}
