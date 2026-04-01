# 组件开发规范

## 组件库

### shadcn/ui（优先使用）

添加组件：`npx shadcn@latest add <component>`

**已安装组件：**
- Button, Card, Switch, DropdownMenu, Tooltip, Progress
- Input, Popover, Calendar, Dialog, AlertDialog
- Label, Select, Checkbox

**常用组件：**
- 表单：Input, Textarea, Select, Checkbox, Form, Label
- 反馈：Dialog, Sheet, Popover, Toast, Alert, AlertDialog
- 展示：Table, Tabs, Badge, Avatar

### 自定义组件

放在 `src/components/` 目录：

```
components/
├── ui/                    # shadcn/ui 组件
├── charts/                # 图表组件
│   ├── index.ts           # 统一导出
│   ├── SleepScoreGauge.tsx
│   ├── SleepTrendChart.tsx
│   └── SleepStructureChart.tsx
├── chat/                  # AI 聊天组件
│   ├── index.ts           # 统一导出
│   ├── ChatDialog.tsx     # 聊天弹窗主组件
│   ├── ChatMessages.tsx   # 消息列表（支持流式）
│   ├── ChatInput.tsx      # 输入框
│   ├── ConversationList.tsx # 对话列表
│   └── ChatFloatingButton.tsx # 全局浮动按钮
├── ThemeScript.tsx        # 主题初始化脚本
├── theme-toggle.tsx       # 主题切换按钮
├── date-range-dialog.tsx  # 日期区间选择弹窗
├── sleep-record-dialog.tsx # 睡眠记录编辑弹窗
└── canvas-background.tsx  # 首页 Hero 区域夜空动画背景
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

## 表单验证

使用 Zod 进行表单验证，错误信息显示在字段下方：

```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

const handleSubmit = () => {
  const result = schema.safeParse(formData)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
    })
    setErrors(fieldErrors)
    return
  }
  // 提交 result.data
}

// 渲染时显示错误
<Input className={errors.email ? "border-destructive" : ""} />
{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
```

## AI 聊天组件

### 流式输出

`ChatMessages` 组件直接接收 `UIMessage[]` 类型，支持流式渲染：

```tsx
import type { UIMessage } from 'ai'

interface ChatMessagesProps {
  messages: UIMessage[]
  isLoading: boolean
}

// 渲染时遍历 message.parts
{message.parts.map((part, i) => {
  if (part.type === 'text') {
    return <div key={i}>{part.text}</div>
  }
})}
```

### 注意事项

1. **不要转换消息格式**：直接传递 `useChat` 返回的 `messages`，不要转换为静态字符串
2. **使用 UIMessage 类型**：从 `ai` 包导入 `UIMessage` 类型
3. **流式响应**：后端使用 `streamText().toUIMessageStreamResponse()` 返回流式响应
