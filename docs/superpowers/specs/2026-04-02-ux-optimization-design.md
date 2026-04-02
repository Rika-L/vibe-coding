# UX 全面优化设计文档

**日期**: 2026-04-02
**主题**: 交互体验全面优化

## 1. 优化目标

为项目所有可交互元素提供统一的、高质量的交互体验，包括：
- 统一的鼠标指针反馈
- 平滑的过渡动画
- 清晰的 hover/active 状态
- 友好的 loading 状态
- 优化的 focus-visible 样式

## 2. 涉及范围

| 类别 | 文件 |
|------|------|
| 按钮组件 | `src/components/ui/button.tsx` |
| 输入框 | `src/components/ui/input.tsx` |
| 开关 | `src/components/ui/switch.tsx` |
| 全局样式 | `src/app/globals.css` |
| 聊天组件 | `src/components/chat/*.tsx` |
| 仪表盘 | `src/app/dashboard/page.tsx` |
| 历史记录 | `src/app/history/page.tsx` |
| 首页 | `src/app/page.tsx` |

## 3. 设计方案

### 3.1 全局交互变量

在 `globals.css` 中添加交互状态 token：

```css
@theme inline {
  /* 现有变量... */

  /* 交互状态变量 */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  --cursor-pointer: pointer;
  --cursor-grab: grab;
  --cursor-grabbing: grabbing;
}
```

### 3.2 Button 组件增强

**当前状态**：
- 有 transition-all
- 无 cursor-pointer
- 无 loading 状态
- 无 active 状态增强

**优化后**：
```tsx
// 添加 cursor-pointer
className = "... cursor-pointer"

// 添加 active 状态
active:not-aria-[haspopup]:translate-y-px

// 添加 loading 状态
// 1. 接收 loading prop
// 2. loading 时显示 spinner 并禁用
// 3. 添加 disabled:cursor-not-allowed
```

### 3.3 Input 组件增强

**当前状态**：
- 有 focus ring
- 无 hover 状态

**优化后**：
```tsx
// 添加 hover 状态
hover:border-ring/50

// 保持现有 focus 状态
```

### 3.4 Switch 组件增强

**当前状态**：
- 有 transition-all
- 无 cursor-pointer

**优化后**：
```tsx
// 添加 cursor-pointer
className = "... cursor-pointer"
```

### 3.5 页面级元素优化

为手动添加的可交互元素添加状态类：

| 位置 | 元素 | 需添加 |
|------|------|--------|
| ConversationList.tsx | 会话列表项 | cursor-pointer, hover 状态 |
| history/page.tsx | 记录列表项 | cursor-pointer, hover 状态 |
| dashboard/page.tsx | 卡片 | hover 状态增强 |
| page.tsx | 首页卡片 | hover 状态增强 |

### 3.6 Loading 状态实现

在 Button 组件中添加：

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  loading?: boolean;
}

// loading 时：
// 1. 显示 <Spinner /> 图标
// 2. 设置 disabled={true}
// 3. 添加 loading 相关 class
```

## 4. 实现顺序

1. 修改 `globals.css` 添加交互变量
2. 修改 `button.tsx` 添加 cursor-pointer、loading 状态
3. 修改 `input.tsx` 添加 hover 状态
4. 修改 `switch.tsx` 添加 cursor-pointer
5. 优化页面级可交互元素
6. 验证所有组件正常工作

## 5. 验收标准

- [ ] 所有按钮有 cursor-pointer
- [ ] 所有可点击元素有 hover 效果
- [ ] 按钮点击有 active 反馈
- [ ] 异步按钮显示 loading spinner
- [ ] focus-visible 样式清晰可见
- [ ] 过渡动画平滑（200-300ms）
- [ ] 无破坏现有功能
