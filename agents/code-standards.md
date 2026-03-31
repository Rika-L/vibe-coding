# 代码规范

## TypeScript

### 类型定义
- 避免 `any`，使用具体类型
- 接口用于对象结构：`interface User { ... }`
- 类型别名用于联合/交叉类型：`type Status = 'active' | 'inactive'`
- 共享类型放在 `types/` 或 `@types/` 目录

### 命名规范
- 组件：PascalCase（`UserProfile.tsx`）
- 函数：camelCase（`getUserData`）
- 常量：UPPER_SNAKE_CASE（`MAX_RETRY_COUNT`）
- 文件：组件用 PascalCase，工具用 camelCase

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
// 推荐
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// 三元表达式
{isLoading ? <Spinner /> : <Content />}
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

## 文件结构

```tsx
// 1. 导入
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. 类型定义
interface Props {
  // ...
}

// 3. 常量
const MAX_COUNT = 10

// 4. 组件/函数
export function MyComponent({ }: Props) {
  // 4.1 Hooks
  const [state, setState] = useState()

  // 4.2 派生状态
  const derived = useMemo(() => ..., [])

  // 4.3 副作用
  useEffect(() => {}, [])

  // 4.4 事件处理
  const handleClick = () => {}

  // 4.5 渲染
  return <div>...</div>
}
```
