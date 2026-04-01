# API 路由规范

## 认证 API

### POST /api/auth/register

用户注册

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

**Response:**
```json
{
  "message": "注册成功",
  "user": { "id": "...", "email": "..." }
}
```

### POST /api/auth/login

用户登录，设置 `auth-token` Cookie

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout

退出登录，清除 Cookie

### GET /api/auth/me

获取当前登录用户信息

**Response:**
```json
{
  "userId": "...",
  "email": "..."
}
```

## 睡眠数据 API

### POST /api/upload

上传 CSV 文件

**Request:** `FormData` with `file` field

**Response:**
```json
{
  "message": "上传成功",
  "count": 30
}
```

### GET /api/sleep-data

获取睡眠数据列表

**Query:** `?startDate=...&endDate=...`

### GET /api/sleep-history

获取当前用户的睡眠历史

### GET /api/sleep-dates

获取有睡眠记录的日期列表（用于日期选择器禁用日期）

**Response:**
```json
{
  "dates": ["2024-01-01", "2024-01-02", ...]
}
```

### GET /api/sleep-records

获取睡眠记录列表

**Query:** `?startDate=...&endDate=...`

### POST /api/sleep-records

创建睡眠记录

**Request:**
```json
{
  "date": "2024-01-01",
  "bedTime": "2024-01-01T23:00:00",
  "wakeTime": "2024-01-02T07:00:00",
  "sleepDuration": 8,
  "deepSleep": 2,
  "lightSleep": 4,
  "remSleep": 1.5,
  "awakeCount": 1,
  "sleepScore": 85
}
```

### PUT /api/sleep-records/[id]

更新睡眠记录

### DELETE /api/sleep-records/[id]

删除睡眠记录

## AI 分析 API

### POST /api/analyze

AI 分析睡眠数据

**Request:**
```json
{
  "data": [...sleepRecords],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "analysis": "AI 分析结果..."
}
```

## 报告 API

### GET /api/reports

获取分析报告列表

### GET /api/reports/[id]

获取单个报告详情

## AI 聊天 API

### POST /api/chat

AI 聊天（流式输出）

**Request:**
```json
{
  "messages": [
    { "id": "...", "role": "user", "parts": [{ "type": "text", "text": "你好" }] }
  ],
  "conversationId": "..."
}
```

**Response:** Server-Sent Events (SSE) 流式响应

### GET /api/conversations

获取对话列表

**Response:**
```json
{
  "conversations": [
    { "id": "...", "title": "新对话", "createdAt": "...", "updatedAt": "..." }
  ]
}
```

### POST /api/conversations

创建新对话

**Request:**
```json
{ "title": "新对话" }
```

**Response:**
```json
{ "conversation": { "id": "...", "title": "新对话" } }
```

### GET /api/conversations/[id]

获取对话详情（包含消息）

### DELETE /api/conversations/[id]

删除对话

## 路由规范

### 请求验证

使用 Zod 进行请求体验证：

```typescript
import { sleepRecordSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  const body = await request.json()
  const result = sleepRecordSchema.safeParse(body)

  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    )
  }
  // 使用 result.data
}
```

### 响应格式

成功：
```json
{ "message": "操作成功", "data": {...} }
```

错误：
```json
{ "error": "错误信息" }
```

### 认证检查

需要认证的路由使用 `getCurrentUser()`:

```typescript
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: '未登录' }, { status: 401 })
  }
  // ...
}
```

### 错误处理

```typescript
try {
  // ...
} catch (error) {
  console.error('API Error:', error)
  return Response.json(
    { error: error instanceof Error ? error.message : '服务器错误' },
    { status: 500 }
  )
}
```
