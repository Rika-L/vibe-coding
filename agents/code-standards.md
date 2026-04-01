# 代码规范

## TypeScript

### 类型定义

- 避免 `any`，使用具体类型
- 接口用于对象结构：`interface User { ... }`
- 类型别名用于联合类型：`type Status = 'active' | 'inactive'`
- 共享类型放在 `src/types/` 目录

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.tsx` |
| 函数 | camelCase | `getUserData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 文件 | 组件用 PascalCase，工具用 camelCase |

## React

### 函数式组件

```tsx
// 推荐
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>
}

// 不推荐
export const MyComponent = ({ prop }: Props) => <div>{prop}</div>
```

### Hooks 规范

- 只在顶层调用 Hooks
- 只在 React 函数中调用 Hooks
- 自定义 Hook 以 `use` 开头

### 条件渲染

```tsx
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data ? <Content data={data} /> : <Empty />}
```

## 注释规范

### JSDoc（公共函数）

```tsx
/**
 * 格式化日期
 * @param date - 日期对象或字符串
 * @param format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  // ...
}
```

### 行内注释（复杂逻辑）

```tsx
// 计算折扣价格，超过100元打8折，否则打9折
const finalPrice = price > 100 ? price * 0.8 : price * 0.9
```

### 避免无意义注释

```tsx
// ❌ 不好
// 设置 loading 为 true
setLoading(true)

// ✅ 好
// 防止用户在请求期间重复提交
setLoading(true)
```

## 项目特定规范

### 表单验证

使用 Zod 定义验证 schema：

```typescript
// src/lib/validations/auth.ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
})

export type LoginInput = z.infer<typeof loginSchema>
```

### API 路由

- 放在 `src/app/api/` 目录
- 使用标准响应格式
- 必须处理错误情况

### 数据库操作

- 使用 Prisma Client
- 从 `@/lib/prisma` 导入

```typescript
import prisma from '@/lib/prisma'

const user = await prisma.user.findUnique({ where: { id } })
```

### 认证检查

```typescript
import { getCurrentUser } from '@/lib/auth'

const user = await getCurrentUser()
if (!user) {
  return Response.json({ error: '未登录' }, { status: 401 })
}
```

### AI 调用

```typescript
import { generateSleepAnalysis } from '@/lib/ai'

const result = await generateSleepAnalysis(prompt)
```
