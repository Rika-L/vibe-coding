# 睡眠记录批量删除/清空功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在历史页面添加批量删除和清空全部睡眠记录功能

**Architecture:** 后端在 `/api/sleep-records/route.ts` 添加批量删除和清空全部的 DELETE 接口；前端在历史页面添加复选框列和操作按钮

**Tech Stack:** Next.js App Router, Prisma, React

---

### Task 1: 后端 API - 批量删除接口

**Files:**
- Modify: `src/app/api/sleep-records/route.ts`

- [ ] **Step 1: 添加批量删除和清空全部的 DELETE 处理**

在 `route.ts` 文件末尾添加：

```typescript
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get('all');

    // 清空全部记录
    if (deleteAll === 'true') {
      await prisma.sleepRecord.deleteMany({
        where: { userId: user.userId },
      });
      return NextResponse.json({ success: true, deletedCount: 'all' });
    }

    // 批量删除
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请选择要删除的记录' }, { status: 400 });
    }

    const result = await prisma.sleepRecord.deleteMany({
      where: {
        id: { in: ids },
        userId: user.userId,
      },
    });

    return NextResponse.json({ success: true, deletedCount: result.count });
  }
  catch (error) {
    console.error('Batch delete sleep records error:', error);
    return NextResponse.json({ error: '删除记录失败' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/api/sleep-records/route.ts
git commit -m "feat: 添加睡眠记录批量删除和清空全部API"
```

---

### Task 2: 前端 - 添加复选框和操作按钮

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: 添加状态变量**

在现有状态变量区域添加：

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [selectAll, setSelectAll] = useState(false);
const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
const [confirmText, setConfirmText] = useState('');
```

- [ ] **Step 2: 添加复选框处理函数**

在 `handleDeleteRecord` 函数后添加：

```typescript
const handleSelectOne = (id: string) => {
  setSelectedIds(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
};

const handleSelectAll = () => {
  if (selectAll) {
    setSelectedIds(new Set());
    setSelectAll(false);
  } else {
    setSelectedIds(new Set(records.map(r => r.id)));
    setSelectAll(true);
  }
};

const handleBatchDelete = async () => {
  if (selectedIds.size === 0) return;

  setDeletingId('batch');
  try {
    const res = await fetch('/api/sleep-records', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '删除失败');
    }

    toast.success(`已删除 ${selectedIds.size} 条记录`);
    setSelectedIds(new Set());
    setSelectAll(false);
    setBatchDeleteDialogOpen(false);
    fetchData();
  }
  catch (error) {
    toast.error(error instanceof Error ? error.message : '删除失败');
  }
  finally {
    setDeletingId(null);
  }
};

const handleClearAll = async () => {
  if (confirmText !== '确认清空') return;

  setDeletingId('clear');
  try {
    const res = await fetch('/api/sleep-records?all=true', {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '清空失败');
    }

    toast.success('已清空所有记录');
    setSelectedIds(new Set());
    setSelectAll(false);
    setClearAllDialogOpen(false);
    setConfirmText('');
    fetchData();
  }
  catch (error) {
    toast.error(error instanceof Error ? error.message : '清空失败');
  }
  finally {
    setDeletingId(null);
  }
};
```

- [ ] **Step 3: 修改表格 - 添加复选框列**

在表格的 `<thead>` 第一列添加：

```tsx
<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-10">
  <input
    type="checkbox"
    checked={selectAll}
    onChange={handleSelectAll}
    className="h-4 w-4 rounded border-border"
  />
</th>
```

在表格的 `<tbody>` 每行开头添加：

```tsx
<td className="px-4 py-3 w-10">
  <input
    type="checkbox"
    checked={selectedIds.has(record.id)}
    onChange={() => handleSelectOne(record.id)}
    onClick={(e) => e.stopPropagation()}
    className="h-4 w-4 rounded border-border"
  />
</td>
```

- [ ] **Step 4: 在筛选区域下方添加操作栏**

在筛选 Card 后面、表格 Card 前面添加：

```tsx
{records.length > 0 && (
  <div className="mb-4 flex items-center justify-between">
    <div className="text-sm text-muted-foreground">
      已选择
      {' '}
      <span className="font-medium text-foreground">{selectedIds.size}</span>
      {' '}
      条记录
    </div>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setBatchDeleteDialogOpen(true)}
        disabled={selectedIds.size === 0 || !!deletingId}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        批量删除
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setClearAllDialogOpen(true)}
        disabled={pagination.total === 0 || !!deletingId}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        清空全部
      </Button>
    </div>
  </div>
)}
```

- [ ] **Step 5: 添加批量删除确认对话框**

在现有删除确认对话框后添加：

```tsx
<AlertDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
  <AlertDialogContent className="sm:max-w-md">
    <div className="flex flex-col items-center pt-6 pb-2">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <Trash2 className="h-7 w-7 text-destructive" />
      </div>
      <AlertDialogHeader className="items-center text-center">
        <AlertDialogTitle className="text-xl">确认删除选中的记录？</AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          即将删除
          {' '}
          <span className="font-medium text-destructive">{selectedIds.size}</span>
          {' '}
          条睡眠记录，此操作无法撤销。
        </AlertDialogDescription>
      </AlertDialogHeader>
    </div>
    <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
      <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleBatchDelete}
        disabled={deletingId === 'batch'}
        className="w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
      >
        {deletingId === 'batch'
          ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                删除中...
              </>
            )
          : (
              '确认删除'
            )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- [ ] **Step 6: 添加清空全部确认对话框**

在批量删除对话框后添加：

```tsx
<AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
  <AlertDialogContent className="sm:max-w-md">
    <div className="flex flex-col items-center pt-6 pb-2">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <Trash2 className="h-7 w-7 text-destructive" />
      </div>
      <AlertDialogHeader className="items-center text-center">
        <AlertDialogTitle className="text-xl text-destructive">确认清空所有记录？</AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          此操作将删除所有
          {' '}
          <span className="font-medium text-destructive">{pagination.total}</span>
          {' '}
          条睡眠记录，且无法恢复！
        </AlertDialogDescription>
      </AlertDialogHeader>
    </div>
    <div className="px-6 pb-4">
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder='请输入"确认清空"'
        className="text-center"
      />
    </div>
    <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
      <AlertDialogCancel
        className="w-full sm:w-auto"
        onClick={() => setConfirmText('')}
      >
        取消
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleClearAll}
        disabled={confirmText !== '确认清空' || deletingId === 'clear'}
        className="w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
      >
        {deletingId === 'clear'
          ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                清空中...
              </>
            )
          : (
              '确认清空'
            )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- [ ] **Step 7: 提交代码**

```bash
git add src/app/history/page.tsx
git commit -m "feat: 添加睡眠记录批量删除和清空全部功能"
```

---

### Task 3: 验证功能

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 手动测试**

1. 登录后进入历史页面
2. 确认表格显示复选框
3. 勾选几条记录，确认顶部显示已选数量
4. 点击"批量删除"，确认弹出对话框
5. 确认后删除，验证数据刷新
6. 点击"清空全部"，确认需要输入"确认清空"
7. 输入后确认，验证所有记录被清空

- [ ] **Step 3: 提交完成**

```bash
git add -A
git commit -m "feat: 完成睡眠记录批量删除和清空全部功能"
```
