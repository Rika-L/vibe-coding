import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(50, "姓名最多 50 个字符")
    .transform((val) => (val.length >= 2 ? val : undefined))
    .optional(),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(6, "密码至少 6 个字符")
    .max(100, "密码最多 100 个字符"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const sleepRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "请选择有效日期"),
  sleepDuration: z.number().positive("睡眠时长必须大于 0").max(24, "睡眠时长不能超过 24 小时"),
  bedTime: z.string().regex(/^\d{2}:\d{2}$/, "请输入有效时间").optional().or(z.literal("")),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/, "请输入有效时间").optional().or(z.literal("")),
  deepSleep: z.number().min(0).max(24).nullable().optional(),
  lightSleep: z.number().min(0).max(24).nullable().optional(),
  remSleep: z.number().min(0).max(24).nullable().optional(),
  awakeCount: z.number().int().min(0).nullable().optional(),
  sleepScore: z.number().int().min(0).max(100).nullable().optional(),
  heartRate: z.number().int().min(30).max(200).nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SleepRecordInput = z.infer<typeof sleepRecordSchema>;
