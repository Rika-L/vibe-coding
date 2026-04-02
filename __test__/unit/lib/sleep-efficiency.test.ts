import { describe, it, expect } from 'vitest';

// 睡眠效率计算函数（从 dashboard/page.tsx 提取）
interface SleepRecord {
  id: string;
  date: string;
  sleepDuration: number;
  deepSleep: number | null;
  lightSleep: number | null;
  remSleep: number | null;
  sleepScore: number | null;
  bedTime: string | null;
  wakeTime: string | null;
  heartRate: number | null;
}

const calculateEfficiency = (record: SleepRecord): number => {
  if (!record.bedTime || !record.wakeTime || record.sleepDuration <= 0) {
    return 0;
  }
  const bedTime = new Date(record.bedTime).getTime();
  const wakeTime = new Date(record.wakeTime).getTime();
  const timeInBed = (wakeTime - bedTime) / (1000 * 60 * 60);
  if (timeInBed <= 0) return 0;
  return Math.round((record.sleepDuration / timeInBed) * 100);
};

const getEfficiencyStatus = (efficiency: number): { label: string; color: string } => {
  if (efficiency >= 85) return { label: '良好', color: 'bg-green-500' };
  if (efficiency >= 70) return { label: '一般', color: 'bg-yellow-500' };
  return { label: '需改善', color: 'bg-red-500' };
};

describe('calculateEfficiency', () => {
  it('should calculate efficiency correctly for normal sleep', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: 7,
      deepSleep: 2,
      lightSleep: 3,
      remSleep: 1.5,
      sleepScore: 85,
      bedTime: '2024-01-14T23:00:00.000Z',
      wakeTime: '2024-01-15T07:00:00.000Z',
      heartRate: 62,
    };
    // 7 hours sleep / 8 hours in bed = 87.5% -> 88%
    expect(calculateEfficiency(record)).toBe(88);
  });

  it('should return 0 when bedTime is null', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: 7,
      deepSleep: 2,
      lightSleep: 3,
      remSleep: 1.5,
      sleepScore: 85,
      bedTime: null,
      wakeTime: '2024-01-15T07:00:00.000Z',
      heartRate: 62,
    };
    expect(calculateEfficiency(record)).toBe(0);
  });

  it('should return 0 when wakeTime is null', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: 7,
      deepSleep: 2,
      lightSleep: 3,
      remSleep: 1.5,
      sleepScore: 85,
      bedTime: '2024-01-14T23:00:00.000Z',
      wakeTime: null,
      heartRate: 62,
    };
    expect(calculateEfficiency(record)).toBe(0);
  });

  it('should return 0 when sleepDuration is 0', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: 0,
      deepSleep: null,
      lightSleep: null,
      remSleep: null,
      sleepScore: null,
      bedTime: '2024-01-14T23:00:00.000Z',
      wakeTime: '2024-01-15T07:00:00.000Z',
      heartRate: null,
    };
    expect(calculateEfficiency(record)).toBe(0);
  });

  it('should return 0 when sleepDuration is negative', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: -1,
      deepSleep: null,
      lightSleep: null,
      remSleep: null,
      sleepScore: null,
      bedTime: '2024-01-14T23:00:00.000Z',
      wakeTime: '2024-01-15T07:00:00.000Z',
      heartRate: null,
    };
    expect(calculateEfficiency(record)).toBe(0);
  });

  it('should return 0 when time in bed is 0 or negative', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: 7,
      deepSleep: null,
      lightSleep: null,
      remSleep: null,
      sleepScore: null,
      bedTime: '2024-01-15T07:00:00.000Z',
      wakeTime: '2024-01-15T07:00:00.000Z',
      heartRate: null,
    };
    expect(calculateEfficiency(record)).toBe(0);
  });

  it('should handle efficiency over 100%', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: 9,
      deepSleep: 3,
      lightSleep: 4,
      remSleep: 2,
      sleepScore: 90,
      bedTime: '2024-01-14T23:00:00.000Z',
      wakeTime: '2024-01-15T07:00:00.000Z',
      heartRate: 60,
    };
    // 9 hours sleep / 8 hours in bed = 112.5% -> 113%
    expect(calculateEfficiency(record)).toBe(113);
  });

  it('should round to nearest integer', () => {
    const record: SleepRecord = {
      id: '1',
      date: '2024-01-15',
      sleepDuration: 7.5,
      deepSleep: 2,
      lightSleep: 3.5,
      remSleep: 1.5,
      sleepScore: 87,
      bedTime: '2024-01-14T23:00:00.000Z',
      wakeTime: '2024-01-15T07:00:00.000Z',
      heartRate: 62,
    };
    // 7.5 / 8 = 93.75% -> 94%
    expect(calculateEfficiency(record)).toBe(94);
  });
});

describe('getEfficiencyStatus', () => {
  it('should return 良好 for efficiency >= 85', () => {
    expect(getEfficiencyStatus(85)).toEqual({ label: '良好', color: 'bg-green-500' });
    expect(getEfficiencyStatus(90)).toEqual({ label: '良好', color: 'bg-green-500' });
    expect(getEfficiencyStatus(100)).toEqual({ label: '良好', color: 'bg-green-500' });
  });

  it('should return 一般 for efficiency between 70 and 84', () => {
    expect(getEfficiencyStatus(70)).toEqual({ label: '一般', color: 'bg-yellow-500' });
    expect(getEfficiencyStatus(75)).toEqual({ label: '一般', color: 'bg-yellow-500' });
    expect(getEfficiencyStatus(84)).toEqual({ label: '一般', color: 'bg-yellow-500' });
  });

  it('should return 需改善 for efficiency < 70', () => {
    expect(getEfficiencyStatus(69)).toEqual({ label: '需改善', color: 'bg-red-500' });
    expect(getEfficiencyStatus(50)).toEqual({ label: '需改善', color: 'bg-red-500' });
    expect(getEfficiencyStatus(0)).toEqual({ label: '需改善', color: 'bg-red-500' });
  });

  it('should handle edge cases', () => {
    expect(getEfficiencyStatus(84.9)).toEqual({ label: '一般', color: 'bg-yellow-500' });
    expect(getEfficiencyStatus(69.9)).toEqual({ label: '需改善', color: 'bg-red-500' });
  });
});
