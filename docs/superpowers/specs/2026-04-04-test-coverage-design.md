# 测试覆盖率提升设计

## 概述

项目现有 E2E 测试覆盖认证和基础页面，但随着功能增加，测试覆盖率不足。本文档规划分三个阶段补全测试。

## 现状分析

### 已有测试

| 类型 | 文件 | 覆盖范围 |
|------|------|----------|
| E2E | auth.spec.ts | 注册、登录、登出 |
| E2E | dashboard.spec.ts | Dashboard 页面布局和功能 |
| E2E | history.spec.ts | 历史记录页面 |
| 单元 | lib/* | auth, ai, csv-parser, charts, utils |
| 单元 | components/* | canvas-background, theme-toggle |
| 集成 | api/auth.test.ts | 认证 API |
| 集成 | api/sleep-data.test.ts | 睡眠数据 API |
| 集成 | api/sleep-records.test.ts | 睡眠记录 API |

### 缺失覆盖

| 类型 | 缺失项 |
|------|--------|
| 页面 | 首页上传功能、设置页面、报告页面 |
| API | /api/upload, /api/analyze, /api/chat, /api/conversations, /api/reports, /api/user/* |
| 组件 | charts/*, chat/*, dialogs, settings/* |

## 设计方案

按测试类型分层，优先覆盖用户核心流程。

### 阶段 1：E2E 测试

**目标**：覆盖核心用户流程

**新增文件**：

#### `__test__/e2e/upload.spec.ts`

测试首页上传功能：

- 拖拽上传 CSV 文件
- 点击按钮选择文件上传
- 上传成功后跳转 Dashboard
- 未登录时拦截并跳转登录
- 非 CSV 文件错误提示
- 上传失败错误处理

#### `__test__/e2e/settings.spec.ts`

测试设置页面：

- 访问控制（未登录重定向）
- 页面布局显示
- 修改个人资料（名称、头像）
- 修改密码
- 密码验证错误

#### `__test__/e2e/report.spec.ts`

测试报告页面：

- 访问控制
- 报告列表显示
- 报告详情页
- 空状态显示

#### `__test__/e2e/chat.spec.ts`

测试 AI 聊天功能：

- 未登录时点击聊天提示登录
- 登录后打开聊天对话框
- 发送消息并收到响应
- 对话历史列表
- 新建对话
- 删除对话

**预估用例数**：25-30 个

### 阶段 2：API 集成测试

**目标**：确保后端 API 稳定性

**新增文件**：

#### `__test__/integration/api/upload.test.ts`

- CSV 上传成功
- 非 CSV 文件拒绝
- 空文件处理
- 格式错误记录跳过
- 未认证拒绝

#### `__test__/integration/api/analyze.test.ts`

- AI 分析请求成功
- 日期范围参数验证
- 无数据时响应
- 未认证拒绝

#### `__test__/integration/api/chat.test.ts`

- 聊天流式响应
- 对话 ID 关联
- 未认证拒绝

#### `__test__/integration/api/conversations.test.ts`

- 获取对话列表
- 创建新对话
- 获取对话详情
- 删除对话

#### `__test__/integration/api/reports.test.ts`

- 获取报告列表
- 获取报告详情
- 报告不存在处理

#### `__test__/integration/api/user.test.ts`

- 获取个人资料
- 更新个人资料
- 修改密码
- 密码验证

**预估用例数**：20-25 个

### 阶段 3：组件单元测试

**目标**：补充组件细节覆盖

**新增文件**：

#### `__test__/unit/components/charts/*.test.tsx`

- SleepScoreGauge: 渲染、数据格式化
- SleepTrendChart: 渲染、空状态
- SleepStructureChart: 渲染、数据格式化
- HeartRateChart: 渲染、数据格式化
- SleepRegularityChart: 渲染

#### `__test__/unit/components/chat/*.test.tsx`

- ChatDialog: 打开/关闭
- ChatMessages: 消息渲染
- ChatInput: 输入、发送
- ConversationList: 列表渲染、删除

#### `__test__/unit/components/dialogs.test.tsx`

- SleepRecordDialog: 打开/关闭、表单提交
- DateRangeDialog: 打开/关闭、日期选择

#### `__test__/unit/components/settings/*.test.tsx`

- ProfileForm: 表单验证、提交
- PasswordForm: 表单验证、提交

**预估用例数**：15-20 个

## 技术方案

### E2E 测试

- 框架：Playwright
- 模式：复用现有 auth helper（每个测试文件创建独立用户）
- 配置：复用 `playwright.config.ts`

### API 集成测试

- 框架：Vitest
- 数据库：内存 SQLite（复用现有 `vitest.config.integration.ts`）
- 认证：直接操作数据库创建用户和 session

### 组件单元测试

- 框架：Vitest + Testing Library
- 配置：复用 `vitest.config.components.ts`
- Mock：API 调用使用 vi.mock

## 执行计划

1. 创建 Worktree 隔离环境
2. 按阶段顺序实施
3. 每阶段完成后运行全量测试确保无回归
4. 完成后使用 code-reviewer agent 审查

## 验收标准

- 所有新增测试通过
- 现有测试无回归
- 测试覆盖率显著提升（需运行覆盖率报告确认）
