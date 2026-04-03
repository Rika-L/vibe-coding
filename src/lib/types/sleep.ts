/** 睡眠记录基础字段 - 所有变体共享 */
export interface SleepRecordBase {
  id?: string;
  date: string | Date;
  sleepDuration: number;
  deepSleep?: number | null;
  lightSleep?: number | null;
  remSleep?: number | null;
  sleepScore?: number | null;
  heartRate?: number | null;
}

/** API 响应中的睡眠记录 */
export interface SleepRecord extends SleepRecordBase {
  id: string;
  date: string;
  bedTime?: string | null;
  wakeTime?: string | null;
  awakeCount?: number | null;
}

/** 表单输入中的睡眠记录 */
export interface SleepRecordFormData extends SleepRecordBase {
  bedTime?: string;
  wakeTime?: string;
  awakeCount?: number | null;
}

/** 分析 API 使用的睡眠记录 */
export interface SleepRecordAnalysis {
  date: Date;
  sleepDuration: number;
  deepSleep: number | null;
  lightSleep: number | null;
  remSleep: number | null;
  sleepScore: number | null;
  heartRate?: number | null;
}
