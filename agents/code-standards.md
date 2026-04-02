# 代码规范

## 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.tsx` |
| 函数 | camelCase | `getUserData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY` |

## 项目特定

### 表单验证

Zod schemas 在 `src/lib/validations/`

### 数据库

```typescript
import prisma from '@/lib/prisma'
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
```
