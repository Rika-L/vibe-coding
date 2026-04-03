# 代码规范

## 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.tsx` |
| 函数 | camelCase | `getUserData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY` |
| 文件 | kebab-case | `date-range-dialog.tsx` |

## Git 提交

使用 Conventional Commits:

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

示例: `feat: 添加心率图表组件`

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

### API 响应格式

```typescript
// 成功
return Response.json({ message: '操作成功', data: result })

// 错误
return Response.json({ error: '错误信息' }, { status: 400 })
```

## 代码质量

- ESLint + Stylistic 插件
- Husky pre-commit: 自动修复代码格式
- Commitlint: 提交信息规范检查
