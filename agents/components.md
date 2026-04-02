# 组件

## 目录

```
components/
├── ui/              # shadcn/ui 组件
├── charts/          # ECharts 图表
│   ├── SleepScoreGauge.tsx
│   ├── SleepTrendChart.tsx
│   └── SleepStructureChart.tsx
├── chat/            # AI 聊天
│   ├── ChatDialog.tsx
│   ├── ChatMessages.tsx
│   ├── ChatInput.tsx
│   ├── ConversationList.tsx
│   └── ChatFloatingButton.tsx
├── date-range-dialog.tsx
├── sleep-record-dialog.tsx
├── theme-toggle.tsx
└── canvas-background.tsx
```

## shadcn/ui

添加组件: `npx shadcn@latest add <component>`

已安装: Button, Card, Dialog, AlertDialog, Input, Select, Calendar, Popover, DropdownMenu, Switch, Tooltip, Progress, Label, Checkbox

## 规范

- 命名导出: `export function MyComponent()`
- Props 必须有类型定义
- 使用 `@/lib/utils` 的 `cn()` 合并类名

## AI 聊天

- 使用 `useChat` Hook from `@ai-sdk/react`
- 消息类型: `UIMessage` from `ai`
- 后端: `streamText().toUIMessageStreamResponse()`
