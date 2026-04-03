# 项目架构

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # 认证 API
│   │   │   ├── login/      # 登录
│   │   │   ├── logout/     # 登出
│   │   │   ├── me/         # 当前用户
│   │   │   └── register/   # 注册
│   │   ├── analyze/        # AI 分析
│   │   ├── chat/           # AI 聊天 (流式)
│   │   ├── conversations/  # 对话管理
│   │   ├── reports/        # 报告
│   │   ├── sleep-*/        # 睡眠数据相关
│   │   ├── upload/         # CSV 上传
│   │   └── user/           # 用户设置
│   │       ├── password/   # 修改密码
│   │       └── profile/    # 修改资料
│   ├── dashboard/          # 仪表盘
│   ├── history/            # 历史记录
│   ├── login/              # 登录页
│   ├── register/           # 注册页
│   ├── report/[id]/        # 报告详情
│   └── settings/           # 设置页面
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   ├── charts/             # ECharts 图表
│   ├── chat/               # AI 聊天组件
│   └── settings/           # 设置表单
├── lib/
│   ├── auth.ts             # JWT 认证
│   ├── prisma.ts           # 数据库
│   ├── ai.ts               # AI 分析
│   ├── ai-provider.ts      # AI Provider
│   ├── csv-parser.ts       # CSV 解析
│   └── validations/        # Zod schemas
└── proxy.ts                # 路由守卫
```

## 数据模型

### User
- id, email, password, name, **avatar**
- 关联: SleepRecord, AnalysisReport, Conversation

### SleepRecord
- id, date, bedTime, wakeTime, sleepDuration
- deepSleep, lightSleep, remSleep, awakeCount, sleepScore
- **heartRate** (新增)
- userId (可选关联)

### AnalysisReport
- id, title, summary, suggestions, sleepQuality, dataRange
- userId (可选关联)

### Conversation / Message
- 对话和消息，用于 AI 聊天历史
- 级联删除: 用户删除时自动删除对话

## 认证

- JWT 存在 Cookie (`auth-token`)，7 天过期
- 受保护路由: `/dashboard`, `/history`, `/report/*`, `/settings`
- 认证页面已登录时重定向: `/login`, `/register`

## AI 集成

- 模型: `astron-code-latest` (讯飞星火)
- 分析: `src/lib/ai.ts`
- 聊天: `src/lib/ai-provider.ts` + AI SDK 6.0
- **注意**: 必须用 `.chat()` 指定 Chat Completions API
- 支持 Markdown 渲染 (react-markdown)
