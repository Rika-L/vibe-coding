import Papa from "papaparse";

export interface ParsedSleepData {
  date: string;
  bedTime: string;
  wakeTime: string;
  sleepDuration?: number;
  deepSleep?: number;
  lightSleep?: number;
  remSleep?: number;
  awakeCount?: number;
  sleepScore?: number;
  heartRate?: number;
}

export function parseCSV(csvText: string): Promise<ParsedSleepData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        const parsed = data.map((row) => parseRow(row));
        resolve(parsed);
      },
      error: (error) => reject(error),
    });
  });
}

function parseRow(row: Record<string, string>): ParsedSleepData {
  const getValue = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = row[key] ?? row[key.toLowerCase()] ?? row[key.toUpperCase()];
      if (value !== undefined) return value;
    }
    return undefined;
  };

  const parseNumber = (value: string | undefined): number | undefined => {
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  return {
    date: getValue("date", "Date", "日期") ?? "",
    bedTime: getValue("bedTime", "bed_time", "bed time", "入睡时间") ?? "",
    wakeTime: getValue("wakeTime", "wake_time", "wake time", "醒来时间") ?? "",
    sleepDuration: parseNumber(getValue("sleepDuration", "sleep_duration", "sleep duration", "睡眠时长", "总睡眠")),
    deepSleep: parseNumber(getValue("deepSleep", "deep_sleep", "deep", "深睡")),
    lightSleep: parseNumber(getValue("lightSleep", "light_sleep", "light", "浅睡")),
    remSleep: parseNumber(getValue("remSleep", "rem_sleep", "rem", "REM", "快速眼动")),
    awakeCount: parseNumber(getValue("awakeCount", "awake_count", "awake", "清醒次数")),
    sleepScore: parseNumber(getValue("sleepScore", "sleep_score", "score", "睡眠评分", "得分")),
    heartRate: parseNumber(getValue("heartRate", "heart_rate", "heart", "心率")),
  };
}
