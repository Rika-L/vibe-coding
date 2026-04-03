# AI 工作指南

## 项目概述

睡眠数据分析平台 - 用户上传睡眠数据，查看可视化报告，获取 AI 分析建议。

## 核心原则

1. **不要**随意删除现有代码
2. **不要**提交敏感信息
3. 不确定时先询问
4. 完成大功能后更新 `agents/` 文档
5. **验证优先** - 完成后用 `/verify` 验证

## OMC 工作流

### 新需求开发

```
/ralplan → 规划 → /autopilot 或 /ultrawork → 实现 → /code-reviewer → 验证
```

| 阶段 | 命令 | 说明 |
|------|------|------|
| 规划 | `/ralplan` | 模糊需求自动触发深度访谈 |
| 执行 | `/autopilot` | 全自动执行明确任务 |
| 执行 | `/ultrawork` | 并行高效，适合多文件 |
| 协作 | `/team` | 多 agent 协作复杂任务 |
| 审查 | `/code-reviewer` | 新 agent 会话，独立审查 |

### Bug 修复

```
/debugger 或 /trace → 定位根因 → 修复 → /verify → 验证
```

- `/debugger` - 根因分析，构建/编译错误解决
- `/trace` - 证据驱动的因果追踪，回归隔离
- **禁止猜测性修复**

### 代码审查

```
/code-reviewer → 审查结果 → 修复 → /verify
```

- 审查和实现分开进行（不同 agent 会话）
- 关注：逻辑缺陷、SOLID 原则、性能、安全

## 问题处理速查

| 问题类型 | 处理方式 |
|---------|---------|
| UI/UX 设计 | `/ui-ux-pro-max` 或 `/designer` |
| 调试问题 | `/debugger` 或 `/trace` |
| 新功能设计 | `/ralplan` 或 `/planner` |
| 代码审查 | `/code-reviewer` |
| 复杂重构 | `/architect` 规划 → `/executor` 实现 |
| 文档查询 | `/document-specialist` |
| 测试问题 | `/test-engineer` |
| 安全审查 | `/security-reviewer` |

## OMC 常用技能

| 命令 | 用途 |
|------|------|
| `/autopilot` | 全自动执行，适合明确任务 |
| `/ultrawork` | 并行执行，高效完成 |
| `/ralplan` | 规划 + 访谈，模糊需求首选 |
| `/team` | 多 agent 协作 |
| `/debugger` | 调试分析 |
| `/trace` | 因果追踪 |
| `/verify` | 验证完成度 |
| `/code-reviewer` | 代码审查 |
| `/cancel` | 取消当前模式 |

## 项目记忆

使用 OMC 记忆系统保存跨会话知识：

- `<remember>` - 保存 7 天（工作记忆）
- `<remember priority>` - 永久保存（优先上下文）

### 已保存的记忆

参见 `~/.claude/projects/-home-rika-code-rika-bishe/memory/MEMORY.md`

## 文档索引

| 文件 | 用途 |
|------|------|
| [architecture.md](agents/architecture.md) | 目录结构、数据模型 |
| [tech-stack.md](agents/tech-stack.md) | 技术栈 |
| [api-routes.md](agents/api-routes.md) | API 路由列表 |
| [components.md](agents/components.md) | 组件目录 |
| [testing.md](agents/testing.md) | 测试命令 |
| [code-standards.md](agents/code-standards.md) | 代码规范 |
| [styling.md](agents/styling.md) | 样式规范 |

## 常用命令

```bash
npm run dev           # 启动开发服务器
npm run build         # 构建生产版本
npx prisma studio     # 数据库管理界面
npm run test          # 单元测试 (watch)
npm run test:e2e      # E2E 测试
```
