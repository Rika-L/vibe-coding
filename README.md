# Sleep Data Analysis Platform

睡眠数据分析平台 - 用户上传睡眠数据，查看可视化报告，获取 AI 分析建议。

## 功能特性

- 📊 **数据可视化** - 睡眠时长、深睡、浅睡、REM 等指标图表展示
- 🤖 **AI 智能分析** - 基于讯飞星火大模型，提供个性化睡眠改善建议
- 💬 **AI 聊天助手** - 随时咨询睡眠相关问题
- 📅 **历史记录** - 查看和管理历史睡眠数据
- 🌙 **主题切换** - 支持浅色/深色/系统主题

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite + Prisma |
| 认证 | JWT + Cookies |
| UI | React 19 + shadcn/ui + Tailwind CSS |
| 图表 | ECharts |
| AI | AI SDK 5.0 + 讯飞星火 |
| 测试 | Vitest + Playwright |

## 快速开始

### 环境要求

- Node.js 18+
- npm / pnpm / yarn

### 安装

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 测试

```bash
# 单元测试
npm run test:run

# 测试覆盖率
npm run test:coverage

# 集成测试
npm run test:integration

# E2E 测试
npm run test:e2e
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── dashboard/         # 仪表盘
│   ├── history/           # 历史记录
│   ├── login/             # 登录
│   ├── register/          # 注册
│   └── report/[id]/       # 报告详情
├── components/
│   ├── ui/               # shadcn/ui 组件
│   ├── charts/           # ECharts 图表
│   └── chat/             # AI 聊天组件
└── lib/
    ├── auth.ts           # JWT 认证
    ├── prisma.ts         # 数据库客户端
    ├── ai.ts             # AI 分析服务
    └── validations/      # Zod 验证规则
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT 密钥 (必填)
JWT_SECRET="your-secret-key"

# 讯飞星火 API (AI 功能)
XFYUN_API_KEY="your-api-key"
```

## 主要功能

### 1. 用户认证
- 注册/登录
- JWT Token 认证
- 7 天登录状态保持

### 2. 睡眠数据管理
- CSV 文件导入
- 手动添加记录
- 日期范围筛选

### 3. 数据可视化
- 睡眠时长趋势图
- 睡眠质量饼图
- 详细数据表格

### 4. AI 分析报告
- 自动生成周报/月报
- 个性化改善建议
- AI 聊天助手

## API 文档

详见 [agents/api-routes.md](agents/api-routes.md)

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/sleep-records` | GET/POST | 获取/创建睡眠记录 |
| `/api/sleep-records/[id]` | GET/PUT/DELETE | 记录 CRUD |
| `/api/reports` | POST | 生成分析报告 |
| `/api/sleep-dates` | GET | 获取有记录的日期 |

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

## License

MIT
