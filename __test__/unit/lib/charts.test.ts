import { describe, it, expect } from 'vitest';

// 测试图表组件的数据处理函数
// 这些函数是从图表组件中提取的业务逻辑

describe('Chart Data Processing', () => {
  describe('SleepScoreGauge color logic', () => {
    const getScoreColor = (score: number): string => {
      if (score >= 80) return '#10b981'; // emerald green
      if (score >= 60) return '#06b6d4'; // cyan
      return '#f43f5e'; // rose red
    };

    it('should return emerald green for score >= 80', () => {
      expect(getScoreColor(80)).toBe('#10b981');
      expect(getScoreColor(90)).toBe('#10b981');
      expect(getScoreColor(100)).toBe('#10b981');
    });

    it('should return cyan for score between 60 and 79', () => {
      expect(getScoreColor(60)).toBe('#06b6d4');
      expect(getScoreColor(70)).toBe('#06b6d4');
      expect(getScoreColor(79)).toBe('#06b6d4');
    });

    it('should return rose red for score < 60', () => {
      expect(getScoreColor(59)).toBe('#f43f5e');
      expect(getScoreColor(50)).toBe('#f43f5e');
      expect(getScoreColor(0)).toBe('#f43f5e');
    });
  });

  describe('Sleep Trend Chart data transformation', () => {
    const transformToChartData = (records: Array<{ date: string; sleepDuration: number; sleepScore: number | null }>) => {
      return records.map(r => ({
        date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        duration: r.sleepDuration,
        score: r.sleepScore,
      }));
    };

    it('should transform records to chart data format', () => {
      const records = [
        { date: '2024-01-15', sleepDuration: 7.5, sleepScore: 85 },
        { date: '2024-01-16', sleepDuration: 8, sleepScore: 90 },
      ];

      const result = transformToChartData(records);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '1月15日',
        duration: 7.5,
        score: 85,
      });
    });

    it('should handle null sleepScore', () => {
      const records = [
        { date: '2024-01-15', sleepDuration: 7.5, sleepScore: null },
      ];

      const result = transformToChartData(records);

      expect(result[0].score).toBeNull();
    });
  });

  describe('Sleep Structure Chart data transformation', () => {
    const transformToStructureData = (records: Array<{ deepSleep: number | null; lightSleep: number | null; remSleep: number | null }>) => {
      return records.map(r => ({
        deep: r.deepSleep,
        light: r.lightSleep,
        rem: r.remSleep,
      }));
    };

    it('should transform records to structure data format', () => {
      const records = [
        { deepSleep: 2, lightSleep: 4, remSleep: 1.5 },
        { deepSleep: 2.5, lightSleep: 3.5, remSleep: 2 },
      ];

      const result = transformToStructureData(records);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ deep: 2, light: 4, rem: 1.5 });
    });

    it('should handle null values', () => {
      const records = [
        { deepSleep: null, lightSleep: null, remSleep: null },
      ];

      const result = transformToStructureData(records);

      expect(result[0]).toEqual({ deep: null, light: null, rem: null });
    });
  });

  describe('BedTime/WakeTime data transformation', () => {
    const transformToTimeData = (records: Array<{ date: string; bedTime: string | null }>) => {
      return records
        .filter(r => r.bedTime !== null)
        .map(r => ({
          date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          bedTime: r.bedTime!,
        }));
    };

    it('should filter out null bedTime and transform', () => {
      const records = [
        { date: '2024-01-15', bedTime: '2024-01-14T23:00:00.000Z' },
        { date: '2024-01-16', bedTime: null },
        { date: '2024-01-17', bedTime: '2024-01-16T22:30:00.000Z' },
      ];

      const result = transformToTimeData(records);

      expect(result).toHaveLength(2);
      expect(result[0].bedTime).toBe('2024-01-14T23:00:00.000Z');
    });

    it('should return empty array when all records have null', () => {
      const records = [
        { date: '2024-01-15', bedTime: null },
      ];

      const result = transformToTimeData(records);

      expect(result).toHaveLength(0);
    });
  });

  describe('Average calculation', () => {
    const calculateAverage = (values: number[]): number => {
      if (values.length === 0) return 0;
      const sum = values.reduce((acc, v) => acc + v, 0);
      return Math.round((sum / values.length) * 10) / 10;
    };

    it('should calculate average correctly', () => {
      expect(calculateAverage([7, 8, 9])).toBe(8);
      expect(calculateAverage([7.5, 8.5])).toBe(8);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(calculateAverage([7, 8])).toBe(7.5);
    });
  });
});
