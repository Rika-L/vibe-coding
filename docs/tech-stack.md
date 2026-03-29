# 睡眠质量分析平台 - 技术选型文档

## 项目概述
一个支持用户上传 CSV 睡眠数据、AI 智能分析并生成可视化报告的全栈 Web 应用。

---

## 技术栈选型

### 1. 前端框架
| 技术 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Next.js | 16.2.1 | 已集成，App Router 模式 |
| UI 库 | React | 19.2.4 | 已集成，配合 React Compiler |
| 样式 | Tailwind CSS | 4.x | 已集成，原子化 CSS |
| 组件库 | shadcn/ui | latest | 基于 Radix UI 的无样式组件 |

### 2. 后端 & 数据库
| 技术 | 选型 | 说明 |
|------|------|------|
| ORM | Prisma | 类型安全，迁移方便，Next.js 生态主流 |
| 数据库 | SQLite | 轻量，单文件，适合毕设/个人项目 |
| 文件存储 | 本地磁盘 | CSV 上传文件暂存，分析后清理 |

### 3. 图表可视化
| 技术 | 选型 | 说明 |
|------|------|------|
| 图表库 | ECharts | 功能丰富，支持多种睡眠数据图表 |
| React 封装 | echarts-for-react | 或直接使用 echarts 原生 API |

### 4. AI 分析
| 技术 | 选型 | 说明 |
|------|------|------|
| AI SDK | Vercel AI SDK | 统一接口，支持多模型 |
| 模型 | DeepSeek / OpenAI | 通过环境变量配置，默认 DeepSeek 性价比高 |

### 5. 文件处理
| 技术 | 选型 | 说明 |
|------|------|------|
| CSV 解析 | Papaparse | 浏览器+Node 双端支持，流式解析大文件 |
| 文件上传 | Next.js API Routes + FormData | 原生支持，无需额外库 |

---

## 项目结构

```
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── upload/route.ts       # CSV 上传接口
│   │   ├── analyze/route.ts      # AI 分析接口
│   │   └── reports/[id]/route.ts # 报告查询接口
│   ├── page.tsx                  # 首页（上传入口）
│   ├── dashboard/page.tsx        # 数据看板
│   └── report/[id]/page.tsx      # 报告详情页
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── charts/                   # ECharts 封装组件
│   └── upload/                   # 文件上传相关
├── lib/                          # 工具函数
│   ├── prisma.ts                 # Prisma 客户端
│   ├── ai.ts                     # AI SDK 配置
│   └── csv-parser.ts             # CSV 解析工具
├── prisma/
│   └── schema.prisma             # 数据库模型定义
├── public/                       # 静态资源
└── types/                        # TypeScript 类型定义
```

---

## 数据库模型设计

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model SleepRecord {
  id          String   @id @default(uuid())
  date        DateTime
  bedTime     DateTime
  wakeTime    DateTime
  sleepDuration Float  // 睡眠时长（小时）
  deepSleep   Float?   // 深睡时长（小时）
  lightSleep  Float?   // 浅睡时长（小时）
  remSleep    Float?   // REM 睡眠（小时）
  awakeCount  Int?     // 清醒次数
  sleepScore  Int?     // 睡眠评分
  heartRate   Int?     // 平均心率
  createdAt   DateTime @default(now())
}

model AnalysisReport {
  id            String   @id @default(uuid())
  title         String
  summary       String   // AI 生成的总结
  suggestions   String   // 改善建议
  sleepQuality  String   // 整体评价
  dataRange     String   // 数据时间范围
  createdAt     DateTime @default(now())
}
```

---

## 核心功能模块

### 1. CSV 上传模块
- 支持拖拽上传
- 字段映射（自动识别/手动匹配）
- 数据预览与校验
- 批量导入数据库

### 2. 数据可视化模块
- 睡眠时长趋势图（折线图）
- 睡眠结构分析（堆叠柱状图）
- 睡眠质量评分（仪表盘）
- 睡眠规律热力图（日历热力图）

### 3. AI 分析模块
- 睡眠质量评估
- 异常数据识别
- 个性化改善建议
- 生成自然语言报告

---

## 依赖安装清单

```bash
# 数据库
npm install prisma @prisma/client
npx prisma init

# AI SDK
npm install ai @ai-sdk/openai

# 图表
npm install echarts

# CSV 解析
npm install papaparse
npm install -D @types/papaparse

# UI 组件 (shadcn/ui)
npx shadcn add button card input table tabs
npx shadcn add upload progress dialog

# 工具库
npm install date-fns lucide-react
```

---

## 环境变量配置

```env
# .env.local

# 数据库
DATABASE_URL="file:./dev.db"

# AI 配置（二选一）
# DeepSeek
DEEPSEEK_API_KEY="your-deepseek-api-key"

# 或 OpenAI
OPENAI_API_KEY="your-openai-api-key"

# 可选：自定义 AI 模型
AI_MODEL="deepseek-chat"
```

---

## 开发计划

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 项目初始化 + 数据库配置 | 1h |
| 2 | CSV 上传 + 数据解析 | 2h |
| 3 | 数据可视化图表 | 3h |
| 4 | AI 分析接口 | 2h |
| 5 | 报告展示页面 | 2h |
| 6 | UI 美化 + 响应式 | 2h |

---

## 备选方案

| 场景 | 当前选型 | 备选方案 | 切换时机 |
|------|----------|----------|----------|
| 数据库 | SQLite | PostgreSQL | 多用户/高并发 |
| AI 模型 | DeepSeek | Claude/GPT-4 | 需要更强分析能力 |
| 图表 | ECharts | Recharts | 更轻量的 React 方案 |
| ORM | Prisma | Drizzle | 追求更小体积 |

---

## 风险评估

1. **CSV 格式不统一**：提供字段映射功能，支持常见智能手环/手表格式
2. **AI 响应慢**：添加加载状态，支持流式输出
3. **大数据量渲染卡顿**：前端分页，图表数据抽样
4. **AI 成本**：DeepSeek 性价比高，适合学生项目

---

*文档版本: v1.0*
*创建日期: 2026-03-29*
