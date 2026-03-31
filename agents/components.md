# 组件开发规范

## 组件库

### shadcn/ui（优先使用）
- 基于 Radix UI + Tailwind CSS 的高质量组件库
- 添加组件：`npx shadcn@latest add <component>`
- 组件位置：`components/ui/`

常用组件：
- Button, Input, Textarea, Select, Checkbox, Switch
- Dialog, Sheet, Popover, DropdownMenu
- Table, Card, Tabs, Accordion
- Form, Label, FormMessage
- Toast, Alert, Badge, Avatar

### 自定义组件
- 放在 `components/` 目录
- 命名：PascalCase
- 导出：使用命名导出

## 组件结构

```tsx
// 导入
import { Button } from "@/components/ui/button"

// 类型定义
interface MyComponentProps {
  title: string
  onClick?: () => void
}

// 组件
export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onClick}>点击</Button>
    </div>
  )
}
```

## 最佳实践

1. **单一职责**：每个组件只做一件事
2. **可组合**：小组件组合成大组件
3. **可控/不可控**：优先使用受控组件
4. **类型安全**：所有 props 必须有类型定义
