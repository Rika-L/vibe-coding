# 页面交互重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构首页和历史记录页的交互体验，统一组件风格

**Architecture:** 使用 shadcn/ui 组件统一风格，优化按钮布局和交互反馈

**Tech Stack:** Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, sonner

---

## 文件结构

```
src/
├── app/
│   ├── page.tsx              # 首页 - 重构 Header 和交互
│   └── history/
│       └── page.tsx          # 历史记录页 - 重构筛选器和表格
└── components/
    └── ui/
        └── input.tsx         # 新增 - shadcn/ui Input 组件
```

---

### Task 1: 添加 shadcn/ui Input 组件

**Files:**
- Create: `src/components/ui/input.tsx`

- [ ] **Step 1: 创建 Input 组件**

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ui/input.tsx
git commit -m "feat: 添加 shadcn/ui Input 组件"
```

---

### Task 2: 重构首页 Header

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 重构 Header 区域**

将 Header 从右上角固定改为顶部横栏布局，添加 Logo，重新排列按钮。

修改 `src/app/page.tsx` 的 Header 部分：

```tsx
{/* Header */}
<header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
  <div className="container mx-auto flex items-center justify-between px-4 py-3">
    <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
      <Moon className="h-5 w-5 text-primary" />
      <span>睡眠分析</span>
    </Link>

    <div className="flex items-center gap-2">
      {checkingAuth ? null : user ? (
        <>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              看板
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            登出
          </Button>
        </>
      ) : (
        <Link href="/login">
          <Button size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            登录
          </Button>
        </Link>
      )}
      <ThemeToggle />
    </div>
  </div>
</header>
```

- [ ] **Step 2: 调整主内容区域 padding**

移除 `py-20`，改为 `py-8`，因为 Header 不再是 fixed 定位：

```tsx
{/* Main Content */}
<div className="container mx-auto px-4 py-8">
```

- [ ] **Step 3: 移除 Footer 的 fixed 定位**

```tsx
{/* Footer */}
<footer className="mt-auto border-t border-border/50 bg-background/80 backdrop-blur-sm py-4">
  <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
    睡眠质量分析平台 — 让每一夜都有好梦
  </div>
</footer>
```

并调整最外层 div：

```tsx
<div className="flex min-h-screen flex-col bg-linear-to-br from-background via-background to-primary/5">
```

- [ ] **Step 4: 提交**

```bash
git add src/app/page.tsx
git commit -m "refactor: 重构首页 Header 布局"
```

---

### Task 3: 优化首页上传跳转体验

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 添加上传成功延迟跳转**

修改 `handleUpload` 函数，成功后延迟 1.5 秒再跳转：

```tsx
const handleUpload = async (file: File) => {
  if (!file.name.endsWith(".csv")) {
    toast.error("请上传 CSV 文件");
    return;
  }

  if (!user) {
    toast.error("请先登录");
    router.push("/login");
    return;
  }

  setIsUploading(true);
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      if (data.failedCount > 0) {
        toast.warning(`成功导入 ${data.count} 条记录，${data.failedCount} 条失败`);
      } else {
        toast.success(`成功导入 ${data.count} 条记录`);
      }
      // 延迟跳转，给用户反应时间
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      toast.error(data.error || "上传失败");
      setIsUploading(false);
    }
  } catch {
    toast.error("上传出错，请重试");
    setIsUploading(false);
  }
};
```

- [ ] **Step 2: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: 上传成功后延迟跳转，优化体验"
```

---

### Task 4: 重构历史记录页筛选器

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: 导入 Input 组件和图标**

在文件顶部添加导入：

```tsx
import { Calendar, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
```

- [ ] **Step 2: 添加筛选 loading 状态**

在组件内添加状态：

```tsx
const [filtering, setFiltering] = useState(false);
```

- [ ] **Step 3: 重构筛选区域**

替换筛选区域的 Card 内容：

```tsx
{/* Filter Section */}
<Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-medium">筛选条件</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[150px]">
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          开始日期
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          结束日期
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Button onClick={handleFilter} disabled={filtering} className="gap-2">
        {filtering ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            筛选中...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            筛选
          </>
        )}
      </Button>
      <Button variant="outline" onClick={clearFilter} className="gap-2">
        <X className="h-4 w-4" />
        清除
      </Button>
      {pagination.total > 0 && (
        <span className="text-sm text-muted-foreground">
          找到 {pagination.total} 条记录
        </span>
      )}
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 4: 更新 handleFilter 函数**

```tsx
const handleFilter = () => {
  setPagination((prev) => ({ ...prev, page: 1 }));
  setFiltering(true);
  setLoading(true);
};
```

- [ ] **Step 5: 更新 fetchData 的 finally 块**

```tsx
} finally {
  setLoading(false);
  setFiltering(false);
}
```

- [ ] **Step 6: 提交**

```bash
git add src/app/history/page.tsx
git commit -m "refactor: 重构历史记录页筛选器，使用 Input 组件统一风格"
```

---

### Task 5: 优化历史记录页表格交互

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: 添加行选中状态**

在组件内添加：

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
```

- [ ] **Step 2: 优化表格行样式**

修改表格行的 className：

```tsx
<tr
  key={record.id}
  onClick={() => setSelectedId(record.id === selectedId ? null : record.id)}
  className={cn(
    "cursor-pointer border-b border-border/50 transition-all duration-200",
    record.id === selectedId
      ? "bg-primary/10 border-l-2 border-l-primary"
      : "hover:bg-muted/50"
  )}
>
```

- [ ] **Step 3: 导入 cn 工具函数**

在文件顶部添加：

```tsx
import { cn } from "@/lib/utils";
```

- [ ] **Step 4: 提交**

```bash
git add src/app/history/page.tsx
git commit -m "feat: 优化历史记录表格交互，添加行选中效果"
```

---

### Task 6: 测试和最终提交

- [ ] **Step 1: 运行开发服务器测试**

```bash
npm run dev
```

测试项目：
1. 首页 Header 布局是否正确
2. 登录/登出按钮是否正常工作
3. 上传文件后是否延迟跳转
4. 历史记录页筛选器样式是否统一
5. 筛选按钮 loading 状态是否正常
6. 表格行点击选中效果是否正常

- [ ] **Step 2: 最终提交（如有遗漏）**

```bash
git status
# 如有未提交的更改
git add -A
git commit -m "fix: 修复页面交互重构遗漏问题"
```
