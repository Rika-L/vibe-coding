# AI 睡眠专家对话功能设计文档

> 创建日期：2026-04-01

## 概述

添加 AI 睡眠专家对话功能，用户可以与 AI 进行实时对话，获取睡眠健康建议。支持流式输出、多对话管理、历史记录持久化。

## 需求确认

| 需求项 | 决策 |
|--------|------|
| 聊天记录存储 | 持久化到数据库 |
| 入口位置 | 全局浮动按钮（右下角） |
| 弹窗样式 | 居中弹窗 |
| 对话模式 | 多对话模式，支持创建/切换/删除 |
| 流式输出 | 使用 Vercel AI SDK |

## 技术方案

**采用方案：Vercel AI SDK + 自建 UI**

- 利用项目已有的 `ai` SDK (v6.0.141)
- 使用 `useChat` hook 处理流式输出
- 基于 shadcn/ui Dialog 组件自建聊天 UI
- 无需新增大型依赖

## 数据模型

### Conversation - 对话

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| title | String | 对话标题 |
| userId | String | 关联用户 |
| messages | Message[] | 关联消息 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Message - 消息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| role | String | "user" \| "assistant" |
| content | String | 消息内容 |
| conversationId | String | 关联对话 |
| createdAt | DateTime | 创建时间 |

### Prisma Schema

```prisma
model Conversation {
  id        String    @id @default(uuid())
  title     String
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([userId])
}

model Message {
  id             String       @id @default(uuid())
  role           String       // "user" | "assistant"
  content        String       // @db.Text for long content
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())

  @@index([conversationId])
}
```

## API 设计

### 路由列表

| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/chat` | POST | 流式聊天（Vercel AI SDK 标准） |
| `/api/conversations` | GET | 获取对话列表 |
| `/api/conversations` | POST | 创建新对话 |
| `/api/conversations/[id]` | GET | 获取对话详情（含消息） |
| `/api/conversations/[id]` | DELETE | 删除对话 |
| `/api/conversations/[id]/title` | PATCH | 更新对话标题 |

### 流式聊天 API

```typescript
// src/app/api/chat/route.ts
import { streamText } from 'ai'
import { xfyun } from '@/lib/ai-provider'

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json()

  // 1. 验证用户身份
  // 2. 验证对话归属
  // 3. 保存用户消息到数据库

  const result = streamText({
    model: xfyun('astron-code-latest'),
    system: '你是一位专业的睡眠健康专家，擅长分析睡眠数据并提供改善建议。请用中文回答，回答要专业但通俗易懂。',
    messages,
  })

  // 流式响应完成后保存 AI 回复（通过 onFinish 回调）

  return result.toDataStreamResponse()
}
```

## 组件设计

### 目录结构

```
src/components/chat/
├── index.ts                    # 统一导出
├── ChatDialog.tsx              # 聊天弹窗主组件
├── ChatMessages.tsx            # 消息列表区域
├── ChatInput.tsx               # 输入框区域
├── ConversationList.tsx        # 对话列表侧边栏
└── ChatFloatingButton.tsx      # 全局浮动按钮
```

### 组件职责

| 组件 | 职责 |
|------|------|
| `ChatFloatingButton` | 固定右下角浮动按钮，点击打开弹窗 |
| `ChatDialog` | 居中弹窗容器，管理对话状态和切换 |
| `ConversationList` | 左侧对话列表，支持新建/删除/切换对话 |
| `ChatMessages` | 消息列表展示，支持流式渲染、Markdown 渲染 |
| `ChatInput` | 输入框 + 发送按钮，支持回车发送 |

### 弹窗布局

```
┌─────────────────────────────────────┐
│  睡眠专家 AI              [─] [✕]  │
├──────────┬──────────────────────────┤
│          │                          │
│  对话列表  │      消息列表区域        │
│          │                          │
│  [+新对话] │                          │
│          │  ──────────────────────  │
│          │  [输入框........] [发送]  │
└──────────┴──────────────────────────┘
```

### 尺寸规格

- 弹窗尺寸：`max-w-4xl w-full max-h-[80vh]`
- 左侧对话列表：`w-64`
- 右侧聊天区域：`flex-1`

## 技术实现细节

### 1. 讯飞星火适配 Vercel AI SDK

```typescript
// src/lib/ai-provider.ts
import { createOpenAI } from '@ai-sdk/openai'

export const xfyun = createOpenAI({
  apiKey: process.env.XFYUN_API_KEY,
  baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
})
```

### 2. 流式聊天 Hook 使用

```typescript
import { useChat } from 'ai/react'

const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
  api: '/api/chat',
  body: { conversationId },
  initialMessages: [], // 从数据库加载的历史消息
  onFinish: (message) => {
    // 消息完成后的处理
  },
})
```

### 3. Markdown 渲染

安装依赖：

```bash
npm install react-markdown
```

使用：

```tsx
import ReactMarkdown from 'react-markdown'

<ReactMarkdown>{message.content}</ReactMarkdown>
```

### 4. 全局浮动按钮集成

在 `src/app/layout.tsx` 中引入：

```tsx
import { ChatFloatingButton } from '@/components/chat'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatFloatingButton />
      </body>
    </html>
  )
}
```

## 新增依赖

| 包名 | 用途 |
|------|------|
| `react-markdown` | 渲染 AI 回复中的 Markdown |

## 实现步骤

1. 更新 Prisma Schema，添加 Conversation 和 Message 模型
2. 创建 AI Provider 配置 (`src/lib/ai-provider.ts`)
3. 实现 API 路由
4. 创建聊天组件
5. 集成到 layout.tsx
6. 测试流式输出功能

## 注意事项

- 流式响应完成后需要保存 AI 回复到数据库
- 对话标题可自动根据第一条消息生成，或允许用户编辑
- 需要处理网络错误和重试逻辑
- 消息内容较长时使用 `@db.Text` 类型
