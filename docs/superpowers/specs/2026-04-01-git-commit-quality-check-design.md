# Git 提交代码质量检查设计

## 概述

在 Git 提交时自动执行代码质量检查，确保代码风格统一、提交格式规范。

## 技术选型

| 功能 | 工具 | 说明 |
|------|------|------|
| 代码检查 | ESLint + @stylistic | 现有 ESLint 扩展格式规则 |
| 提交格式 | Commitlint + Conventional Commits | 强制规范化提交信息 |
| Git Hooks | Husky | 管理 Git 钩子 |
| 暂存区检查 | lint-staged | 只检查暂存文件，提升效率 |

## 工作流程

```
git commit
    │
    ▼
┌─────────────────┐
│  pre-commit     │  ← Husky 触发
│  (lint-staged)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ESLint 检查    │  ← 仅检查暂存文件
│  格式 + 质量    │
└────────┬────────┘
         │ 通过
         ▼
┌─────────────────┐
│  commit-msg     │  ← Husky 触发
│  (commitlint)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  提交格式校验   │  ← Conventional Commits
└────────┬────────┘
         │ 通过
         ▼
    提交成功
```

## Conventional Commits 规范

### 格式

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户登录功能` |
| `fix` | 修复 bug | `fix: 修复登录验证失败问题` |
| `docs` | 文档变更 | `docs: 更新 API 文档` |
| `style` | 代码格式（不影响逻辑） | `style: 格式化代码缩进` |
| `refactor` | 重构（非新功能/bug修复） | `refactor: 重构认证逻辑` |
| `test` | 测试相关 | `test: 添加登录单元测试` |
| `chore` | 构建/工具/依赖 | `chore: 更新依赖版本` |

### Scope（可选）

表示影响范围，如 `auth`、`api`、`ui` 等。

### 示例

```bash
# 简单提交
feat: 添加睡眠数据导出功能

# 带 scope
feat(api): 添加用户偏好设置接口

# 带 body
fix: 修复日期筛选边界问题

当结束日期为空时，默认使用当前日期作为结束日期。

Closes #123
```

## 配置文件结构

```
项目根目录/
├── .husky/
│   ├── pre-commit      # 提交前检查
│   └── commit-msg      # 提交信息校验
├── eslint.config.mjs   # 扩展现有配置
├── commitlint.config.js # 新增
└── package.json        # 添加 lint-staged 配置
```

## 依赖安装

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional @stylistic/eslint-plugin
```

## 配置详情

### 1. Husky 初始化

```bash
npx husky init
```

### 2. lint-staged 配置（package.json）

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

### 3. commitlint.config.js

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    ],
  },
};
```

### 4. ESLint 扩展（eslint.config.mjs）

添加 `@stylistic/eslint-plugin` 格式规则：

```javascript
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  // 现有配置...
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
]);
```

### 5. Git Hooks 脚本

**.husky/pre-commit**
```bash
npx lint-staged
```

**.husky/commit-msg**
```bash
npx --no -- commitlint --edit "$1"
```

## 使用方式

### 正常提交

```bash
git add .
git commit -m "feat: 添加新功能"
# 自动执行 ESLint 检查 + 提交格式校验
```

### 跳过检查（紧急情况）

```bash
git commit -m "feat: 紧急修复" --no-verify
```

**注意**：`--no-verify` 应谨慎使用，仅限紧急情况。

## 错误处理

| 场景 | 错误信息 | 解决方案 |
|------|---------|---------|
| ESLint 不通过 | 具体的 lint 错误 | 修复代码后重新提交 |
| 提交格式错误 | `type must be one of [...]` | 使用正确的 type 前缀 |
| 提交信息过长 | `header must not be longer than 72 characters` | 缩短标题或使用 body |

## 与现有工作流集成

与 AGENTS.md 中定义的工作流一致：

```
新需求 → 创建 worktree → 开发 → 提交 PR → 新 agent 审查 → 合并 → 清理 worktree
                         ↑
                    此处自动检查
```

每次提交都会自动执行质量检查，确保进入 PR 的代码符合规范。

## 注意事项

1. **首次克隆仓库**：需执行 `npm run prepare` 初始化 Husky
2. **IDE 集成**：建议配置编辑器 ESLint 插件，实时反馈
3. **CI/CD**：可在流水线中添加 `npm run lint` 作为额外保障
