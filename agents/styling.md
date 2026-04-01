# 样式规范

## Tailwind CSS

### 优先使用 Tailwind

- 原子化 CSS，无需维护单独的样式文件
- 响应式前缀：`sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- 状态变体：`hover:`, `focus:`, `active:`, `disabled:`

### 常用类

```tsx
// 布局
flex, grid, gap-4, p-4, m-4
container, mx-auto, max-w-md

// 文字
text-sm, text-lg, font-bold, text-center
text-muted-foreground, text-destructive

// 颜色
bg-primary, text-muted-foreground, border-border
bg-card, text-card-foreground

// 圆角/阴影
rounded-lg, shadow-md

// 状态
hover:bg-primary/90, focus:ring-2, disabled:opacity-50

// 响应式
sm:text-lg, md:grid-cols-2, lg:flex-row
```

## 设计系统

### 颜色变量

使用 shadcn/ui 定义的 CSS 变量：

| 变量 | 用途 |
|------|------|
| `--primary` | 主色 |
| `--secondary` | 次要色 |
| `--accent` | 强调色 |
| `--muted` | 柔和色 |
| `--destructive` | 危险色 |
| `--border` | 边框色 |
| `--background` | 背景色 |
| `--foreground` | 前景色 |

### 间距

遵循 Tailwind 间距系统：`1` = 4px

### 字体

使用 Tailwind 字体大小：`text-xs` ~ `text-9xl`

## 主题切换

项目使用 `next-themes` 实现暗色模式：

```tsx
import { ThemeToggle } from '@/components/theme-toggle'

// 在页面中使用
<ThemeToggle />
```

## CSS Modules（备选）

复杂样式可使用 CSS Modules：

```tsx
import styles from './MyComponent.module.css'

export function MyComponent() {
  return <div className={styles.container}>...</div>
}
```
