# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

# AI 工作指南

## 项目概述

睡眠数据分析平台 - 用户可上传睡眠数据，查看可视化报告，获取 AI 分析建议。

## 快速导航

| 指南 | 用途 |
|------|------|
| [architecture.md](agents/architecture.md) | 项目架构、数据模型、目录结构 |
| [tech-stack.md](agents/tech-stack.md) | 技术栈与依赖 |
| [api-routes.md](agents/api-routes.md) | API 路由规范 |
| [components.md](agents/components.md) | 组件开发规范 |
| [styling.md](agents/styling.md) | 样式规范 |
| [code-standards.md](agents/code-standards.md) | 代码规范 |
| [testing.md](agents/testing.md) | 测试规范 |

## 已实现功能

### 核心功能
- 用户认证（注册、登录、JWT）
- CSV 睡眠数据上传与解析
- 睡眠记录 CRUD（增删改查）
- Dashboard 数据可视化（ECharts）
- AI 睡眠分析（讯飞星火）
- 历史分析报告查看

### 交互功能
- Dashboard 日期区间筛选
- AI 分析日期区间选择
- AlertDialog 确认弹窗
- 睡眠记录编辑弹窗

## 核心原则

1. **不要**随意删除现有代码
2. **不要**提交敏感信息（API Key、密码等）
3. **不要**在 `node_modules` 中修改文件
4. 不确定时，先询问用户
5. 完成功能后清除不必要的上下文，避免 AI 幻觉
6. 完成大功能需求后，及时更新 `agents/` 目录下的相关文档

## 工作流程

### 新需求开发流程（Worktree + Code Review）

**必须严格按以下流程执行：**

1. **创建 Worktree**
   - 使用 `superpowers:using-git-worktrees` skill 创建隔离工作树
   - 每个需求在独立的 worktree 中开发，避免污染主分支

2. **开发实现**
   - 使用 `superpowers:brainstorming` skill 设计方案
   - 使用 `best-minds` skill 思考关键决策
   - 按步骤实现，每完成一个功能提交一次

3. **代码审查**
   - 使用 `superpowers:requesting-code-review` skill
   - **关键**：审查由**新的 agent 会话**执行，不带开发上下文
   - 审查者只看 PR diff，模拟真实 Code Review 场景

4. **合并到主分支**
   - 审查通过后合并到 main 分支
   - 清理 worktree

### 流程示意

```
新需求 → 创建 worktree → 开发 → 新 agent 审查 → 合并 → 清理 worktree
```

### Checklist 模板

保存为 `checklist-[需求名称]-日期.md`：

```markdown
## 需求：[需求名称]

### 实现计划
- [ ] 步骤 1: [描述]
- [ ] 步骤 2: [描述]

### 涉及文件
- `[文件路径]` - [修改说明]

### 注意事项
- [风险提示]
```

### Git 提交格式

```
<type>: <description>
```

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `refactor` | 重构 |
| `docs` | 文档 |
| `style` | 样式调整 |
| `chore` | 其他 |

### 问题处理

| 问题类型 | 处理方式 |
|---------|---------|
| UI/UX 设计 | 使用 `ui-ux-pro-max` skill |
| 调试问题 | 使用 `superpowers:systematic-debugging` skill |
| 新功能设计 | 使用 `superpowers:brainstorming` skill |
| 代码审查 | 使用 `superpowers:requesting-code-review` skill |
| 新需求思考 | 使用 `best-minds` skill 模拟专家思维 |

## API 路由速查

详细规范见 [api-routes.md](agents/api-routes.md)

| 路由 | 方法 | 用途 |
|------|------|------|
| `/api/auth/*` | - | 认证（登录/注册/登出） |
| `/api/sleep-records` | GET/POST | 睡眠记录列表/创建 |
| `/api/sleep-records/[id]` | PUT/DELETE | 更新/删除记录 |
| `/api/analyze` | POST | AI 分析 |
| `/api/reports` | GET | 分析报告列表 |

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npx prisma studio # 打开数据库管理界面
```
