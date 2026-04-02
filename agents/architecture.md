# 项目架构

## 目录结构

```
src/
├── app/
│   ├── api/           # API 路由
│   ├── dashboard/     # 仪表盘
│   ├── history/       # 历史记录
│   ├── login/         # 登录
│   ├── register/      # 注册
│   └── report/[id]/   # 报告详情
├── components/
│   ├── ui/            # shadcn/ui
│   ├── charts/        # ECharts 图表
│   └── chat/          # AI 聊天组件
├── lib/
│   ├── auth.ts        # JWT 认证
│   ├── prisma.ts      # 数据库
│   ├── ai.ts          # AI 分析
│   ├── ai-provider.ts # AI Provider
│   └── validations/   # Zod schemas
└── proxy.ts           # 路由守卫
```

## 数据模型

### User
- id, email, password, name

### SleepRecord
- id, date, bedTime, wakeTime, sleepDuration
- deepSleep, lightSleep, remSleep, awakeCount, sleepScore

### AnalysisReport
- id, title, summary, suggestions, sleepQuality

### Conversation / Message
- 对话和消息，用于 AI 聊天历史

## 认证

- JWT 存在 Cookie (`auth-token`)，7 天过期
- 受保护路由: `/dashboard`, `/history`, `/report/*`
- 认证页面已登录时重定向: `/login`, `/register`

## AI 集成

- 模型: `astron-code-latest` (讯飞星火)
- 分析: `src/lib/ai.ts`
- 聊天: `src/lib/ai-provider.ts` + AI SDK 5.0
- **注意**: 必须用 `.chat()` 指定 Chat Completions API
