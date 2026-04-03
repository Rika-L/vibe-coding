'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SleepTrendChart,
  SleepStructureChart,
  HeartRateChart,
  SleepRegularityChart,
} from '@/components/charts';
import type { ChartDataPoint, StructureDataPoint, HeartRateDataPoint, RegularityDataPoint } from './chartData';

interface ChartsGridProps {
  chartData: ChartDataPoint[];
  structureData: StructureDataPoint[];
  heartRateData: HeartRateDataPoint[];
  regularityData: RegularityDataPoint[];
}

export function ChartsGrid({
  chartData,
  structureData,
  heartRateData,
  regularityData,
}: ChartsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Sleep Trend Chart */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">睡眠趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepTrendChart data={chartData} />
        </CardContent>
      </Card>

      {/* Sleep Structure Chart */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">平均睡眠结构</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepStructureChart data={structureData} />
        </CardContent>
      </Card>

      {/* Heart Rate Chart */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">心率趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <HeartRateChart data={heartRateData} />
        </CardContent>
      </Card>

      {/* Sleep Regularity Chart */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">睡眠规律</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepRegularityChart data={regularityData} />
        </CardContent>
      </Card>
    </div>
  );
}
