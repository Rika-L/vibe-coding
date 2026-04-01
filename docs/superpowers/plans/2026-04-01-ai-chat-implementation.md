# AI 睡眠专家对话功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 AI 睡眠专家对话功能，支持流式输出、多对话管理、历史记录持久化。

**Architecture:** 使用 Vercel AI SDK 的 `useChat` hook 处理流式输出，基于 shadcn/ui Dialog 组件自建聊天 UI，讯飞星火 API 作为后端模型。

**Tech Stack:** Next.js 16 App Router, Vercel AI SDK, Prisma, shadcn/ui, react-markdown

---

## 文件结构

### 新建文件

| 文件 | 职责 |
|------|------|
| `src/lib/ai-provider.ts` | 讯飞星火 AI Provider 配置 |
| `src/app/api/chat/route.ts` | 流式聊天 API |
| `src/app/api/conversations/route.ts` | 对话列表 API (GET/POST) |
| `src/app/api/conversations/[id]/route.ts` | 对话详情/删除 API (GET/DELETE) |
| `src/app/api/conversations/[id]/title/route.ts` | 对话标题更新 API (PATCH) |
| `src/components/chat/index.ts` | 组件统一导出 |
| `src/components/chat/ChatFloatingButton.tsx` | 全局浮动按钮 |
| `src/components/chat/ChatDialog.tsx` | 聊天弹窗主组件 |
| `src/components/chat/ConversationList.tsx` | 对话列表侧边栏 |
| `src/components/chat/ChatMessages.tsx` | 消息列表区域 |
| `src/components/chat/ChatInput.tsx` | 输入框区域 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `prisma/schema.prisma` | 添加 Conversation 和 Message 模型 |
| `src/app/layout.tsx` | 引入 ChatFloatingButton |

---

## Task 1: 数据库模型

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 添加 Conversation 和 Message 模型到 Prisma Schema**

在 `prisma/schema.prisma` 文件末尾添加：

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
  content        String
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())

  @@index([conversationId])
}
```

同时更新 User 模型，添加关联：

```prisma
model User {
  id              String            @id @default(uuid())
  email           String            @unique
  password        String
  name            String?
  createdAt       DateTime          @default(now())
  sleepRecords    SleepRecord[]
  analysisReports AnalysisReport[]
  conversations   Conversation[]    // 添加这行

  @@index([email])
}
```

- [ ] **Step 2: 运行数据库迁移**

```bash
npx prisma migrate dev --name add_conversation_message
```

- [ ] **Step 3: 提交更改**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: 添加 Conversation 和 Message 数据模型"
```

---

## Task 2: AI Provider 配置

**Files:**
- Create: `src/lib/ai-provider.ts`

- [ ] **Step 1: 创建 AI Provider 文件**

```typescript
// src/lib/ai-provider.ts
import { createOpenAI } from '@ai-sdk/openai'

export const xfyun = createOpenAI({
  apiKey: process.env.XFYUN_API_KEY,
  baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
})
```

- [ ] **Step 2: 提交更改**

```bash
git add src/lib/ai-provider.ts
git commit -m "feat: 添加讯飞星火 AI Provider 配置"
```

---

## Task 3: 对话管理 API

**Files:**
- Create: `src/app/api/conversations/route.ts`
- Create: `src/app/api/conversations/[id]/route.ts`
- Create: `src/app/api/conversations/[id]/title/route.ts`

- [ ] **Step 1: 创建对话列表 API**

```typescript
// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// 获取对话列表
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1, // 只取第一条消息用于预览
        },
      },
    })

    return NextResponse.json({ conversations })
  }
  catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: '获取对话列表失败' }, { status: 500 })
  }
}

// 创建新对话
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const title = body.title || '新对话'

    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId: user.userId,
      },
    })

    return NextResponse.json({ conversation })
  }
  catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: '创建对话失败' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 创建对话详情/删除 API**

```typescript
// src/app/api/conversations/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// 获取对话详情（含消息）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  }
  catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json({ error: '获取对话失败' }, { status: 500 })
  }
}

// 删除对话
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params

    // 验证对话归属
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 })
    }

    await prisma.conversation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error('Delete conversation error:', error)
    return NextResponse.json({ error: '删除对话失败' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 创建对话标题更新 API**

```typescript
// src/app/api/conversations/[id]/title/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// 更新对话标题
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }

    // 验证对话归属
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 })
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { title: title.trim() },
    })

    return NextResponse.json({ conversation: updated })
  }
  catch (error) {
    console.error('Update conversation title error:', error)
    return NextResponse.json({ error: '更新标题失败' }, { status: 500 })
  }
}
```

- [ ] **Step 4: 提交更改**

```bash
git add src/app/api/conversations
git commit -m "feat: 添加对话管理 API"
```

---

## Task 4: 流式聊天 API

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: 创建流式聊天 API**

```typescript
// src/app/api/chat/route.ts
import { streamText } from 'ai'
import { xfyun } from '@/lib/ai-provider'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const SYSTEM_PROMPT = `你是一位专业的睡眠健康专家，擅长分析睡眠数据并提供改善建议。请用中文回答，回答要专业但通俗易懂。

你可以帮助用户：
1. 解答关于睡眠健康的疑问
2. 提供改善睡眠质量的建议
3. 分析睡眠数据背后的含义
4. 推荐健康的睡眠习惯

请保持友善、专业的态度，给出实用可行的建议。`

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ error: '未登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { messages, conversationId } = body

    if (!conversationId) {
      return new Response(JSON.stringify({ error: '缺少对话ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 验证对话归属
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.userId,
      },
    })

    if (!conversation) {
      return new Response(JSON.stringify({ error: '对话不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 保存用户消息
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user') {
      await prisma.message.create({
        data: {
          role: 'user',
          content: lastMessage.content,
          conversationId,
        },
      })
    }

    const result = streamText({
      model: xfyun('astron-code-latest'),
      system: SYSTEM_PROMPT,
      messages,
      onFinish: async ({ text }) => {
        // 保存 AI 回复
        await prisma.message.create({
          data: {
            role: 'assistant',
            content: text,
            conversationId,
          },
        })

        // 更新对话时间
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        })
      },
    })

    return result.toDataStreamResponse()
  }
  catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: '聊天请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

- [ ] **Step 2: 提交更改**

```bash
git add src/app/api/chat
git commit -m "feat: 添加流式聊天 API"
```

---

## Task 5: 安装 react-markdown 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 react-markdown**

```bash
npm install react-markdown
```

- [ ] **Step 2: 提交更改**

```bash
git add package.json package-lock.json
git commit -m "feat: 添加 react-markdown 依赖"
```

---

## Task 6: 聊天组件 - 基础组件

**Files:**
- Create: `src/components/chat/index.ts`
- Create: `src/components/chat/ChatInput.tsx`
- Create: `src/components/chat/ChatMessages.tsx`

- [ ] **Step 1: 创建组件导出文件**

```typescript
// src/components/chat/index.ts
export { ChatFloatingButton } from './ChatFloatingButton'
export { ChatDialog } from './ChatDialog'
export { ConversationList } from './ConversationList'
export { ChatMessages } from './ChatMessages'
export { ChatInput } from './ChatInput'
```

- [ ] **Step 2: 创建 ChatInput 组件**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface ChatInputProps {
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
}

export function ChatInput({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-muted/30">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的问题..."
        disabled={isLoading}
        className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        rows={1}
        style={{ maxHeight: '120px' }}
      />
      <Button
        onClick={onSubmit}
        disabled={!input.trim() || isLoading}
        size="icon"
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: 创建 ChatMessages 组件**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message } from 'ai/react'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>你好！我是睡眠专家 AI</p>
          <p className="text-xs mt-1">有什么关于睡眠的问题都可以问我</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={cn(
            'flex gap-3',
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          <div
            className={cn(
              'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}
          >
            {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-3 py-2 text-sm',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted',
            )}
          >
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div className="bg-muted rounded-lg px-3 py-2 text-sm">
            <div className="flex gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
```

- [ ] **Step 4: 提交更改**

```bash
git add src/components/chat/index.ts src/components/chat/ChatInput.tsx src/components/chat/ChatMessages.tsx
git commit -m "feat: 添加 ChatInput 和 ChatMessages 组件"
```

---

## Task 7: 聊天组件 - 对话列表

**Files:**
- Create: `src/components/chat/ConversationList.tsx`

- [ ] **Step 1: 创建 ConversationList 组件**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: { content: string }[]
}

interface ConversationListProps {
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  refreshTrigger?: number
}

export function ConversationList({ selectedId, onSelect, onNew, refreshTrigger }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      if (!res.ok)
        throw new Error('获取对话列表失败')
      const data = await res.json()
      setConversations(data.conversations)
    }
    catch (error) {
      console.error('Fetch conversations error:', error)
      toast.error('获取对话列表失败')
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [refreshTrigger])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('确定要删除这个对话吗？'))
      return

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok)
        throw new Error('删除失败')
      toast.success('对话已删除')
      fetchConversations()
      if (selectedId === id) {
        onNew()
      }
    }
    catch (error) {
      console.error('Delete conversation error:', error)
      toast.error('删除对话失败')
    }
  }

  if (isLoading) {
    return (
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-3 border-b">
        <Button onClick={onNew} variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          新对话
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0
          ? (
              <p className="text-xs text-muted-foreground text-center py-4">暂无对话记录</p>
            )
          : (
              conversations.map(conv => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group transition-colors',
                    selectedId === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    type="button"
                    onClick={e => handleDelete(conv.id, e)}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20',
                      selectedId === conv.id && 'hover:bg-primary-foreground/20',
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交更改**

```bash
git add src/components/chat/ConversationList.tsx
git commit -m "feat: 添加 ConversationList 组件"
```

---

## Task 8: 聊天组件 - 主弹窗

**Files:**
- Create: `src/components/chat/ChatDialog.tsx`

- [ ] **Step 1: 创建 ChatDialog 组件**

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConversationList } from './ConversationList'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { toast } from 'sonner'

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: '/api/chat',
    body: { conversationId },
    onFinish: () => {
      setRefreshTrigger(Date.now())
    },
    onError: (error) => {
      toast.error(error.message || '发送消息失败')
    },
  })

  // 加载对话历史
  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (!res.ok)
        throw new Error('加载对话失败')
      const data = await res.json()
      setMessages(data.conversation.messages.map((m: { role: string; content: string }) => ({
        id: m.id || crypto.randomUUID(),
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })))
      setConversationId(id)
    }
    catch (error) {
      console.error('Load conversation error:', error)
      toast.error('加载对话失败')
    }
  }, [setMessages])

  // 创建新对话
  const handleNewConversation = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新对话' }),
      })
      if (!res.ok)
        throw new Error('创建对话失败')
      const data = await res.json()
      setConversationId(data.conversation.id)
      setMessages([])
      setRefreshTrigger(Date.now())
    }
    catch (error) {
      console.error('Create conversation error:', error)
      toast.error('创建对话失败')
    }
  }, [setMessages])

  // 打开时自动创建对话
  useEffect(() => {
    if (open && !conversationId) {
      handleNewConversation()
    }
  }, [open, conversationId, handleNewConversation])

  const onSubmit = () => {
    if (!conversationId) {
      toast.error('请先创建对话')
      return
    }
    handleSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] h-[600px] p-0 flex flex-col sm:max-w-4xl">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg">睡眠专家 AI</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex overflow-hidden">
          <ConversationList
            selectedId={conversationId}
            onSelect={loadConversation}
            onNew={handleNewConversation}
            refreshTrigger={refreshTrigger}
          />
          <div className="flex-1 flex flex-col">
            <ChatMessages messages={messages} isLoading={isLoading} />
            <ChatInput
              input={input}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: 提交更改**

```bash
git add src/components/chat/ChatDialog.tsx
git commit -m "feat: 添加 ChatDialog 主弹窗组件"
```

---

## Task 9: 聊天组件 - 浮动按钮

**Files:**
- Create: `src/components/chat/ChatFloatingButton.tsx`

- [ ] **Step 1: 创建 ChatFloatingButton 组件**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatDialog } from './ChatDialog'
import { MessageCircle } from 'lucide-react'

export function ChatFloatingButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
```

- [ ] **Step 2: 提交更改**

```bash
git add src/components/chat/ChatFloatingButton.tsx
git commit -m "feat: 添加 ChatFloatingButton 全局浮动按钮"
```

---

## Task 10: 集成到布局

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 在 layout.tsx 中引入 ChatFloatingButton**

修改 `src/app/layout.tsx`：

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ChatFloatingButton } from '@/components/chat';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '睡眠质量分析平台',
  description: '上传你的睡眠数据，获取 AI 智能分析报告',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
          <ChatFloatingButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add src/app/layout.tsx
git commit -m "feat: 集成 AI 聊天浮动按钮到全局布局"
```

---

## Task 11: 测试验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试功能清单**

1. 访问任意页面，确认右下角显示浮动按钮
2. 点击按钮，确认弹窗打开
3. 确认自动创建新对话
4. 发送消息，确认流式输出正常
5. 确认消息正确显示（用户消息右侧，AI 回复左侧）
6. 创建新对话，确认切换正常
7. 删除对话，确认删除成功
8. 刷新页面，确认历史对话保留
9. 测试 Markdown 渲染（发送"请用列表形式给我3条睡眠建议"）

---

## 注意事项

1. **流式响应保存**：AI 回复通过 `onFinish` 回调保存到数据库
2. **对话标题**：目前默认"新对话"，后续可添加自动生成标题功能
3. **错误处理**：API 层已有基本错误处理，前端通过 toast 提示
4. **性能优化**：消息列表使用虚拟滚动可优化大量消息场景（当前未实现）
