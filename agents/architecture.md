# 项目架构

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── auth/           # 认证相关 (login, register, logout, me)
│   │   ├── analyze/        # AI 睡眠分析
│   │   ├── upload/         # CSV 上传
│   │   ├── sleep-data/     # 睡眠数据查询
│   │   ├── sleep-dates/    # 有记录的日期列表
│   │   ├── sleep-records/  # 睡眠记录 CRUD
│   │   ├── sleep-history/  # 历史记录
│   │   └── reports/        # 分析报告
│   ├── dashboard/          # 仪表盘页面
│   ├── history/            # 历史记录页面
│   ├── login/              # 登录页面
│   ├── register/           # 注册页面
│   ├── report/[id]/        # 报告详情页面
│   └── page.tsx            # 首页
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   ├── charts/             # 图表组件 (ECharts)
│   ├── date-range-dialog.tsx    # 日期区间选择弹窗
│   ├── sleep-record-dialog.tsx  # 睡眠记录编辑弹窗
│   ├── ThemeScript.tsx     # 主题初始化
│   └── theme-toggle.tsx    # 主题切换
├── lib/
│   ├── auth.ts             # JWT 认证工具
│   ├── prisma.ts           # Prisma 客户端
│   ├── ai.ts               # AI 服务 (讯飞星火)
│   ├── csv-parser.ts       # CSV 解析
│   ├── utils.ts            # 通用工具
│   └── validations/        # 验证逻辑
│       └── auth.ts         # 认证验证
├── middleware.ts           # 路由守卫
└── types/                  # TypeScript 类型

prisma/
├── schema.prisma           # 数据模型
└── dev.db                  # SQLite 数据库
```

## 数据模型

### User - 用户

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| email | String | 邮箱，唯一 |
| password | String | bcrypt 哈希密码 |
| name | String? | 昵称 |
| sleepRecords | SleepRecord[] | 关联睡眠记录 |

### SleepRecord - 睡眠记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| date | DateTime | 睡眠日期 |
| bedTime | DateTime | 入睡时间 |
| wakeTime | DateTime | 起床时间 |
| sleepDuration | Float | 睡眠时长(小时) |
| deepSleep | Float? | 深睡时长 |
| lightSleep | Float? | 浅睡时长 |
| remSleep | Float? | REM 时长 |
| awakeCount | Int? | 清醒次数 |
| sleepScore | Int? | 睡眠评分 |
| heartRate | Int? | 心率 |
| userId | String? | 关联用户 |
| createdAt | DateTime | 创建时间 |

### AnalysisReport - 分析报告

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| title | String | 报告标题 |
| summary | String | 摘要 |
| suggestions | String | 改善建议 |
| sleepQuality | String | 睡眠质量评级 |
| dataRange | String | 数据范围 |
| userId | String? | 关联用户 |
| createdAt | DateTime | 创建时间 |

## 认证流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│  JWT Token  │────▶│   Cookie    │
│  /api/auth  │     │  (7天过期)   │     │  auth-token │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Protected  │◀────│ Middleware  │◀────│   Verify    │
│   Routes    │     │   拦截检查   │     │    Token    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 受保护路由

- `/dashboard` - 仪表盘
- `/history` - 历史记录
- `/report/*` - 报告详情

### 认证页面（已登录时重定向）

- `/login`
- `/register`

## AI 集成

使用讯飞星火 API 进行睡眠分析：

- **模型**: `astron-code-latest`
- **超时**: 60 秒
- **重试**: 最多 3 次，指数退避
- **位置**: `src/lib/ai.ts`

```typescript
import { generateSleepAnalysis } from '@/lib/ai'

const result = await generateSleepAnalysis(prompt)
```
