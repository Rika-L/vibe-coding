# 组件开发规范

## 组件库

### shadcn/ui（优先使用）

添加组件：`npx shadcn@latest add <component>`

**已安装组件：**
- Button, Card, Switch, DropdownMenu

**常用组件：**
- 表单：Input, Textarea, Select, Checkbox, Form, Label
- 反馈：Dialog, Sheet, Popover, Toast, Alert
- 展示：Table, Tabs, Badge, Avatar

### 自定义组件

放在 `src/components/` 目录：

```
components/
├── ui/              # shadcn/ui 组件
├── charts/          # 图表组件
│   ├── index.ts     # 统一导出
│   ├── SleepScoreGauge.tsx
│   ├── SleepTrendChart.tsx
│   └── SleepStructureChart.tsx
├── ThemeScript.tsx
└── theme-toggle.tsx
```

## 图表组件

使用 ECharts，封装在 `components/charts/`：

```typescript
// components/charts/index.ts
export { SleepScoreGauge } from './SleepScoreGauge'
export { SleepTrendChart } from './SleepTrendChart'
export { SleepStructureChart } from './SleepStructureChart'

// 使用
import { SleepScoreGauge } from '@/components/charts'
```

## 组件结构

```tsx
// 1. 导入
import { Button } from "@/components/ui/button"

// 2. 类型定义
interface Props {
  title: string
  onClick?: () => void
}

// 3. 组件
export function MyComponent({ title, onClick }: Props) {
  // 3.1 Hooks
  const [state, setState] = useState()

  // 3.2 派生状态
  const derived = useMemo(() => ..., [])

  // 3.3 副作用
  useEffect(() => {}, [])

  // 3.4 事件处理
  const handleClick = () => {}

  // 3.5 渲染
  return <div>...</div>
}
```

## 最佳实践

1. **单一职责**：每个组件只做一件事
2. **可组合**：小组件组合成大组件
3. **受控组件**：优先使用受控组件
4. **类型安全**：所有 props 必须有类型定义
5. **命名导出**：使用 `export function` 而非 `export default`
