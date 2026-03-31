# 样式规范

## Tailwind CSS

### 优先使用 Tailwind
- 原子化 CSS，无需维护单独的样式文件
- 响应式设计：`sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- 状态变体：`hover:`, `focus:`, `active:`, `disabled:`

### 常用类

```tsx
// 布局
flex, grid, gap-4, p-4, m-4

// 文字
text-sm, text-lg, font-bold, text-center

// 颜色
bg-primary, text-muted-foreground, border-border

// 圆角/阴影
rounded-lg, shadow-md
```

## 设计系统

### 颜色
使用 shadcn/ui 定义的 CSS 变量：
- `--primary` - 主色
- `--secondary` - 次要色
- `--accent` - 强调色
- `--muted` - 柔和色
- `--destructive` - 危险色
- `--border` - 边框色
- `--background` - 背景色
- `--foreground` - 前景色

### 间距
遵循 Tailwind 间距系统：`1` = 4px

### 字体
使用 Tailwind 字体大小：`text-xs` ~ `text-9xl`

## CSS Modules（备选）

复杂样式可使用 CSS Modules：
```tsx
import styles from './MyComponent.module.css'

export function MyComponent() {
  return <div className={styles.container}>...</div>
}
```
