# API 路由

## 认证 `/api/auth/`

| 路由 | 方法 | 用途 |
|------|------|------|
| /register | POST | 注册 |
| /login | POST | 登录，设置 auth-token Cookie |
| /logout | POST | 登出，清除 Cookie |
| /me | GET | 获取当前用户 |

## 睡眠数据

| 路由 | 方法 | 用途 |
|------|------|------|
| /api/upload | POST | 上传 CSV |
| /api/sleep-data | GET | 睡眠数据列表 |
| /api/sleep-dates | GET | 有记录的日期列表 |
| /api/sleep-history | GET | 历史记录 |
| /api/sleep-records | GET/POST | 记录列表/创建 |
| /api/sleep-records/[id] | PUT/DELETE | 更新/删除 |

## AI

| 路由 | 方法 | 用途 |
|------|------|------|
| /api/analyze | POST | AI 分析 |
| /api/chat | POST | AI 聊天 (SSE 流式) |
| /api/conversations | GET/POST | 对话列表/创建 |
| /api/conversations/[id] | GET/DELETE | 对话详情/删除 |

## 报告

| 路由 | 方法 | 用途 |
|------|------|------|
| /api/reports | GET | 报告列表 |
| /api/reports/[id] | GET | 报告详情 |

## 规范

- 认证检查: `getCurrentUser()` from `@/lib/auth`
- 请求验证: Zod `safeParse()`
- 成功响应: `{ message, data }`
- 错误响应: `{ error }`
