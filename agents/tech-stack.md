# 技术栈

版本以 `package.json` 为准。

## 核心

| 技术 | 用途 |
|------|------|
| Next.js 16 | 全栈框架 (App Router) |
| React 19 | UI 库 |
| TypeScript | 类型安全 |
| Tailwind CSS 4 | 样式 |
| shadcn/ui | 组件库 |

## 数据

| 技术 | 用途 |
|------|------|
| Prisma | ORM |
| SQLite | 开发数据库 |

## 认证

| 技术 | 用途 |
|------|------|
| jose | JWT |
| bcryptjs | 密码哈希 |

## AI

| 技术 | 用途 |
|------|------|
| ai | AI SDK 核心 (v6.0) |
| @ai-sdk/react | useChat Hook |
| @ai-sdk/openai-compatible | OpenAI 兼容 Provider |
| react-markdown | Markdown 渲染 |

**注意**: AI SDK 6.0 默认用 Responses API，讯飞只支持 Chat Completions API，需用 `.chat()` 显式指定。

## 图表

| 技术 | 用途 |
|------|------|
| echarts | 图表库 |

## 其他

| 技术 | 用途 |
|------|------|
| papaparse | CSV 解析 |
| date-fns | 日期处理 |
| zod | 验证 |
| sonner | Toast |
| lucide-react | 图标 |
| next-themes | 主题切换 |

## 开发工具

| 技术 | 用途 |
|------|------|
| Vitest | 单元/组件测试 |
| Playwright | E2E 测试 |
| ESLint + Stylistic | 代码检查 |
| Husky + lint-staged | Git Hooks |
| Commitlint | 提交信息规范 |
| React Compiler | 编译优化 |
