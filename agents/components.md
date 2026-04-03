# 组件

## 目录

```
components/
├── ui/                  # shadcn/ui 组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── alert-dialog.tsx
│   ├── input.tsx
│   ├── popover.tsx
│   ├── calendar.tsx
│   ├── dropdown-menu.tsx
│   ├── context-menu.tsx
│   ├── switch.tsx
│   └── ...
├── charts/              # ECharts 图表
│   ├── SleepScoreGauge.tsx      # 睡眠评分仪表盘
│   ├── SleepTrendChart.tsx      # 睡眠趋势图
│   ├── SleepStructureChart.tsx  # 睡眠结构图
│   ├── SleepRegularityChart.tsx # 睡眠规律性
│   ├── HeartRateChart.tsx       # 心率趋势图
│   ├── HeartRateCard.tsx        # 心率卡片
│   ├── BedTimeCard.tsx          # 入睡时间卡片
│   └── WakeTimeCard.tsx         # 起床时间卡片
├── chat/                # AI 聊天
│   ├── ChatDialog.tsx           # 聊天对话框
│   ├── ChatMessages.tsx         # 消息列表
│   ├── ChatInput.tsx            # 输入框
│   ├── ConversationList.tsx     # 对话列表
│   └── ChatFloatingButton.tsx   # 浮动按钮
├── settings/            # 设置表单
│   ├── profile-form.tsx         # 资料表单
│   └── password-form.tsx        # 密码表单
├── date-range-dialog.tsx
├── sleep-record-dialog.tsx
├── theme-toggle.tsx
├── ThemeScript.tsx              # 主题脚本 (防闪烁)
└── canvas-background.tsx
```

## shadcn/ui

添加组件: `npx shadcn@latest add <component>`

已安装: Button, Card, Dialog, AlertDialog, Input, Select, Calendar, Popover, DropdownMenu, ContextMenu, Switch, Tooltip, Progress, Label, Checkbox

## 规范

- 命名导出: `export function MyComponent()`
- Props 必须有类型定义
- 使用 `@/lib/utils` 的 `cn()` 合并类名

## AI 聊天

- 使用 `useChat` Hook from `@ai-sdk/react`
- 消息类型: `UIMessage` from `ai`
- 后端: `streamText().toUIMessageStreamResponse()`
- Markdown 渲染: `react-markdown`

## 图表组件

- 基于 ECharts 封装
- 响应式适配
- 主题感知 (明/暗模式)
