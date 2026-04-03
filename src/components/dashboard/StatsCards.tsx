'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SleepScoreGauge,
  BedTimeCard,
  WakeTimeCard,
  HeartRateCard,
} from '@/components/charts';
import type { SleepRecord } from '@/lib/types';
import type { BedTimeDataPoint, WakeTimeDataPoint, HeartRateDataPoint } from './chartData';

// 计算睡眠效率
const calculateEfficiency = (record: SleepRecord): number => {
  if (!record.bedTime || !record.wakeTime || record.sleepDuration <= 0) {
    return 0;
  }
  const bedTime = new Date(record.bedTime).getTime();
  const wakeTime = new Date(record.wakeTime).getTime();
  const timeInBed = (wakeTime - bedTime) / (1000 * 60 * 60); // 转换为小时
  if (timeInBed <= 0) return 0;
  return Math.round((record.sleepDuration / timeInBed) * 100);
};

// 获取状态标签
const getEfficiencyStatus = (efficiency: number): { label: string; color: string } => {
  if (efficiency >= 85) return { label: '良好', color: 'bg-green-500' };
  if (efficiency >= 70) return { label: '一般', color: 'bg-yellow-500' };
  return { label: '需改善', color: 'bg-red-500' };
};

interface StatsCardsProps {
  records: SleepRecord[];
  avgScore: number;
  bedTimeData: BedTimeDataPoint[];
  wakeTimeData: WakeTimeDataPoint[];
  heartRateData: HeartRateDataPoint[];
}

export function StatsCards({
  records,
  avgScore,
  bedTimeData,
  wakeTimeData,
  heartRateData,
}: StatsCardsProps) {
  const latestRecord = records[0];
  const efficiency = calculateEfficiency(latestRecord);
  const status = getEfficiencyStatus(efficiency);

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {/* Sleep Efficiency */}
      <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            睡眠效率
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{efficiency}</span>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${status.color}`}>
              {status.label}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sleep Score */}
      <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="p-4">
          <SleepScoreGauge score={Math.round(avgScore)} />
        </CardContent>
      </Card>

      {/* Bed Time */}
      <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
        <CardContent className="p-4">
          <BedTimeCard data={bedTimeData} />
        </CardContent>
      </Card>

      {/* Wake Time */}
      <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
        <CardContent className="p-4">
          <WakeTimeCard data={wakeTimeData} />
        </CardContent>
      </Card>

      {/* Heart Rate */}
      <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5">
        <CardContent className="p-4">
          <HeartRateCard data={heartRateData} />
        </CardContent>
      </Card>
    </div>
  );
}
