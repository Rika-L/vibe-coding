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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
