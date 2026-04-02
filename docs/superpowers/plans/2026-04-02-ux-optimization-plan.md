# UX 全面优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为项目所有可交互元素提供统一的、高质量的交互体验

**Architecture:** 通过修改 shadcn/ui 组件添加全局交互变量和状态类，实现统一的 cursor-pointer、transition、hover/active 状态和 loading 效果

**Tech Stack:** Next.js, Tailwind CSS, shadcn/ui

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/app/globals.css` | 添加交互状态 CSS 变量 |
| `src/components/ui/button.tsx` | 添加 cursor-pointer、loading 状态 |
| `src/components/ui/input.tsx` | 添加 hover 状态 |
| `src/components/ui/switch.tsx` | 添加 cursor-pointer |
| `src/components/chat/ConversationList.tsx` | 优化列表项交互状态 |
| `src/app/dashboard/page.tsx` | 优化卡片 hover 状态 |
| `src/app/history/page.tsx` | 优化列表项交互状态 |
| `src/app/page.tsx` | 优化首页卡片 hover 状态 |

---

## Task 1: 添加全局交互变量

**Files:**
- Modify: `src/app/globals.css:120-130`

- [ ] **Step 1: 在 globals.css 添加交互变量**

在 `@layer base` 之后添加：

```css
@layer utilities {
  .cursor-pointer {
    cursor: pointer;
  }

  .transition-interactive {
    transition: all 200ms ease;
  }

  .hover-lift {
    transition: transform 200ms ease, box-shadow 200ms ease;
  }

  .hover-lift:hover {
    transform: translateY(-2px);
  }

  .active-press {
    transition: transform 100ms ease;
  }

  .active-press:active {
    transform: scale(0.98);
  }
}
```

- [ ] **Step 2: 提交更改**

```bash
git add src/app/globals.css
git commit -m "feat: 添加全局交互状态工具类"
```

---

## Task 2: 增强 Button 组件

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: 修改 Button 组件添加 cursor-pointer 和 loading 状态**

将 buttonVariants 的 className 从：
```tsx
'group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4'
```

修改为（添加 cursor-pointer）：
```tsx
'group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4'
```

- [ ] **Step 2: 添加 loading 状态支持**

在 Button 组件中添加 loading prop 和 spinner：

```tsx
import { Loader2 } from 'lucide-react';

// 在 buttonVariants 定义之后，Button 函数之前添加 Spinner 组件
function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} />;
}

// 修改 Button 函数参数
function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  loading = false,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> &
  { loading?: boolean }) {
  return (
    <button
      data-slot="button"
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

- [ ] **Step 3: 提交更改**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: Button 组件添加 cursor-pointer 和 loading 状态"
```

---

## Task 3: 增强 Input 组件

**Files:**
- Modify: `src/components/ui/input.tsx`

- [ ] **Step 1: 添加 hover 状态**

将 Input 的 className 从：
```tsx
'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
```

修改为（添加 hover 状态）：
```tsx
'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-text md:text-sm transition-colors'
```

- [ ] **Step 2: 提交更改**

```bash
git add src/components/ui/input.tsx
git commit -m "feat: Input 组件添加 hover 状态"
```

---

## Task 4: 增强 Switch 组件

**Files:**
- Modify: `src/components/ui/switch.tsx`

- [ ] **Step 1: 添加 cursor-pointer**

将 SwitchPrimitive.Root 的 className 从：
```tsx
'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50'
```

修改为（添加 cursor-pointer）：
```tsx
'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50 cursor-pointer'
```

- [ ] **Step 2: 提交更改**

```bash
git add src/components/ui/switch.tsx
git commit -m "feat: Switch 组件添加 cursor-pointer"
```

---

## Task 5: 优化 ConversationList 组件

**Files:**
- Modify: `src/components/chat/ConversationList.tsx`

- [ ] **Step 1: 优化会话列表项交互状态**

在第 188 行附近找到：
```tsx
'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group transition-colors cursor-pointer',
```

添加 hover 状态：
```tsx
'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group transition-all cursor-pointer hover:bg-muted hover:scale-[1.02]',
```

- [ ] **Step 2: 提交更改**

```bash
git add src/components/chat/ConversationList.tsx
git commit -m "feat: ConversationList 添加 hover 状态"
```

---

## Task 6: 优化 history/page.tsx

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: 优化记录列表项交互状态**

在第 490 行附近找到：
```tsx
'cursor-pointer border-b border-border/50 transition-all duration-200',
```

修改为：
```tsx
'cursor-pointer border-b border-border/50 transition-all duration-200 hover:bg-muted hover:scale-[1.01]',
```

- [ ] **Step 2: 优化报告卡片交互状态**

在第 637 行附近找到：
```tsx
className="group flex items-start justify-between gap-4 rounded-lg border border-border/50 p-4 transition-all hover:border-primary/30 hover:bg-muted/30"
```

添加 scale 效果：
```tsx
className="group flex items-start justify-between gap-4 rounded-lg border border-border/50 p-4 transition-all hover:border-primary/30 hover:bg-muted/30 hover:scale-[1.01]"
```

- [ ] **Step 3: 提交更改**

```bash
git add src/app/history/page.tsx
git commit -m "feat: history 页面添加 hover 状态"
```

---

## Task 7: 优化 dashboard/page.tsx

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: 优化卡片 hover 状态**

在第 455 行附近找到：
```tsx
<Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
```

添加 scale 效果：
```tsx
<Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]">
```

- [ ] **Step 2: 提交更改**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: dashboard 页面添加 hover 状态"
```

---

## Task 8: 优化首页 page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 优化首页卡片 hover 状态**

在第 334 行附近找到：
```tsx
<Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
```

添加 scale 效果：
```tsx
<Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]">
```

- [ ] **Step 2: 提交更改**

```bash
git add src/app/page.tsx
git commit -m "feat: 首页添加 hover 状态"
```

---

## Task 9: 验证和测试

**Files:**
- Run: 验证命令

- [ ] **Step 1: 运行 lint 检查**

```bash
npm run lint
```

- [ ] **Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 运行测试**

```bash
npm test
```

- [ ] **Step 4: 构建验证**

```bash
npm run build
```

- [ ] **Step 5: 提交所有更改**

```bash
git add -A
git commit -m "feat: 完成 UX 全面优化"
```

---

## 验收标准

- [ ] 所有按钮有 cursor-pointer
- [ ] 所有可点击元素有 hover 效果（包括 scale 动画）
- [ ] 按钮点击有 active 反馈（translate-y-px）
- [ ] 异步按钮支持 loading spinner
- [ ] focus-visible 样式清晰可见
- [ ] 过渡动画平滑（200-300ms）
- [ ] 无破坏现有功能（lint、type check、测试通过）
