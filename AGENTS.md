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

## 核心原则

1. **不要**随意删除现有代码
2. **不要**提交敏感信息（API Key、密码等）
3. **不要**在 `node_modules` 中修改文件
4. 不确定时，先询问用户

## 工作流程

### 新需求处理

1. 生成 Checklist 文档给用户确认
2. 用户确认后按步骤实现
3. 每完成一个功能提交一次

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
