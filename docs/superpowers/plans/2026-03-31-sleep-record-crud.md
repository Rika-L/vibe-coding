# 睡眠记录增删改查功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 支持用户手动添加、编辑、删除睡眠记录，在历史记录页面提供完整的 CRUD 操作。

**Architecture:** 创建 SleepRecordDialog 组件处理添加/编辑表单，新建 API 端点处理 CRUD 操作，修改首页和历史记录页面集成功能。

**Tech Stack:** Next.js 16, React, shadcn/ui (Dialog, Input, Button), Prisma, SQLite

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app/api/sleep-records/route.ts` | 新建 | 创建记录 API |
| `src/app/api/sleep-records/[id]/route.ts` | 新建 | 单条记录 CRUD API |
| `src/components/sleep-record-dialog.tsx` | 新建 | 添加/编辑记录对话框 |
| `src/app/page.tsx` | 修改 | 添加手动记录入口 |
| `src/app/history/page.tsx` | 修改 | 添加编辑/删除功能 |

---

### Task 1: 创建睡眠记录 CRUD API

**Files:**
- Create: `src/app/api/sleep-records/route.ts`
- Create: `src/app/api/sleep-records/[id]/route.ts`

- [ ] **Step 1: 创建 sleep-records 目录和创建记录 API**

```typescript
// src/app/api/sleep-records/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      sleepDuration,
      bedTime,
      wakeTime,
      deepSleep,
      lightSleep,
      remSleep,
      awakeCount,
      sleepScore,
      heartRate,
    } = body;

    // 验证必填字段
    if (!date || sleepDuration === undefined || sleepDuration === null) {
      return NextResponse.json(
        { error: "日期和睡眠时长为必填项" },
        { status: 400 }
      );
    }

    // 验证数据范围
    if (sleepDuration <= 0) {
      return NextResponse.json(
        { error: "睡眠时长必须大于0" },
        { status: 400 }
      );
    }

    if (sleepScore !== null && sleepScore !== undefined && (sleepScore < 0 || sleepScore > 100)) {
      return NextResponse.json(
        { error: "睡眠评分范围为0-100" },
        { status: 400 }
      );
    }

    if (heartRate !== null && heartRate !== undefined && (heartRate < 30 || heartRate > 200)) {
      return NextResponse.json(
        { error: "心率范围为30-200" },
        { status: 400 }
      );
    }

    // 检查日期是否已有记录
    const existingRecord = await prisma.sleepRecord.findFirst({
      where: {
        userId: user.userId,
        date: new Date(date),
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: "该日期已有睡眠记录" },
        { status: 400 }
      );
    }

    const record = await prisma.sleepRecord.create({
      data: {
        date: new Date(date),
        sleepDuration: parseFloat(sleepDuration),
        bedTime: bedTime ? new Date(`${date}T${bedTime}:00`) : new Date(`${date}T23:00:00`),
        wakeTime: wakeTime ? new Date(`${date}T${wakeTime}:00`) : new Date(`${date}T07:00:00`),
        deepSleep: deepSleep ? parseFloat(deepSleep) : null,
        lightSleep: lightSleep ? parseFloat(lightSleep) : null,
        remSleep: remSleep ? parseFloat(remSleep) : null,
        awakeCount: awakeCount ? parseInt(awakeCount) : null,
        sleepScore: sleepScore ? parseInt(sleepScore) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        userId: user.userId,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Create sleep record error:", error);
    return NextResponse.json(
      { error: "创建记录失败" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 创建单条记录 CRUD API**

```typescript
// src/app/api/sleep-records/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    const record = await prisma.sleepRecord.findFirst({
      where: { id, userId: user.userId },
    });

    if (!record) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Get sleep record error:", error);
    return NextResponse.json({ error: "获取记录失败" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 检查记录是否存在且属于当前用户
    const existingRecord = await prisma.sleepRecord.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    const {
      date,
      sleepDuration,
      bedTime,
      wakeTime,
      deepSleep,
      lightSleep,
      remSleep,
      awakeCount,
      sleepScore,
      heartRate,
    } = body;

    // 验证数据范围
    if (sleepDuration !== undefined && sleepDuration <= 0) {
      return NextResponse.json(
        { error: "睡眠时长必须大于0" },
        { status: 400 }
      );
    }

    if (sleepScore !== undefined && sleepScore !== null && (sleepScore < 0 || sleepScore > 100)) {
      return NextResponse.json(
        { error: "睡眠评分范围为0-100" },
        { status: 400 }
      );
    }

    if (heartRate !== undefined && heartRate !== null && (heartRate < 30 || heartRate > 200)) {
      return NextResponse.json(
        { error: "心率范围为30-200" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (date) updateData.date = new Date(date);
    if (sleepDuration !== undefined) updateData.sleepDuration = parseFloat(sleepDuration);
    if (bedTime) updateData.bedTime = new Date(`${date || existingRecord.date.toISOString().split('T')[0]}T${bedTime}:00`);
    if (wakeTime) updateData.wakeTime = new Date(`${date || existingRecord.date.toISOString().split('T')[0]}T${wakeTime}:00`);
    if (deepSleep !== undefined) updateData.deepSleep = deepSleep ? parseFloat(deepSleep) : null;
    if (lightSleep !== undefined) updateData.lightSleep = lightSleep ? parseFloat(lightSleep) : null;
    if (remSleep !== undefined) updateData.remSleep = remSleep ? parseFloat(remSleep) : null;
    if (awakeCount !== undefined) updateData.awakeCount = awakeCount ? parseInt(awakeCount) : null;
    if (sleepScore !== undefined) updateData.sleepScore = sleepScore ? parseInt(sleepScore) : null;
    if (heartRate !== undefined) updateData.heartRate = heartRate ? parseInt(heartRate) : null;

    const record = await prisma.sleepRecord.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Update sleep record error:", error);
    return NextResponse.json({ error: "更新记录失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    // 检查记录是否存在且属于当前用户
    const existingRecord = await prisma.sleepRecord.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    await prisma.sleepRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete sleep record error:", error);
    return NextResponse.json({ error: "删除记录失败" }, { status: 500 });
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/api/sleep-records/
git commit -m "feat: 添加睡眠记录 CRUD API"
```

---

### Task 2: 创建睡眠记录对话框组件

**Files:**
- Create: `src/components/sleep-record-dialog.tsx`

- [ ] **Step 1: 创建对话框组件**

```typescript
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Loader2, Moon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SleepRecord {
  id?: string;
  date: string;
  sleepDuration: number;
  bedTime?: string;
  wakeTime?: string;
  deepSleep?: number | null;
  lightSleep?: number | null;
  remSleep?: number | null;
  awakeCount?: number | null;
  sleepScore?: number | null;
  heartRate?: number | null;
}

interface SleepRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: SleepRecord | null;
  onSuccess: () => void;
}

export function SleepRecordDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: SleepRecordDialogProps) {
  const isEdit = !!record?.id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SleepRecord>({
    date: format(new Date(), "yyyy-MM-dd"),
    sleepDuration: 7,
    bedTime: "23:00",
    wakeTime: "07:00",
    deepSleep: null,
    lightSleep: null,
    remSleep: null,
    awakeCount: null,
    sleepScore: null,
    heartRate: null,
  });

  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        bedTime: record.bedTime || "23:00",
        wakeTime: record.wakeTime || "07:00",
      });
    } else {
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        sleepDuration: 7,
        bedTime: "23:00",
        wakeTime: "07:00",
        deepSleep: null,
        lightSleep: null,
        remSleep: null,
        awakeCount: null,
        sleepScore: null,
        heartRate: null,
      });
    }
  }, [record, open]);

  const handleSubmit = async () => {
    if (!formData.date || !formData.sleepDuration) {
      toast.error("请填写日期和睡眠时长");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/sleep-records/${record.id}` : "/api/sleep-records";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "操作失败");
        return;
      }

      toast.success(isEdit ? "记录已更新" : "记录已添加");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SleepRecord, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            {isEdit ? "编辑睡眠记录" : "添加睡眠记录"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "修改睡眠记录信息" : "手动添加一条睡眠记录"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 日期 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              日期 <span className="text-destructive">*</span>
            </label>
            <Popover>
              <PopoverTrigger render={
                <Button variant="outline" className="col-span-3 justify-start text-left font-normal" />
              }>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(new Date(formData.date), "yyyy年MM月dd日", { locale: zhCN }) : "选择日期"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) => date && updateField("date", format(date, "yyyy-MM-dd"))}
                  disabled={(date) => date > new Date()}
                  locale={zhCN}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 睡眠时长 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              睡眠时长 <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.sleepDuration}
              onChange={(e) => updateField("sleepDuration", parseFloat(e.target.value) || 0)}
              className="col-span-3"
              placeholder="小时"
            />
          </div>

          {/* 入睡时间 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">入睡时间</label>
            <Input
              type="time"
              value={formData.bedTime || ""}
              onChange={(e) => updateField("bedTime", e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* 起床时间 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">起床时间</label>
            <Input
              type="time"
              value={formData.wakeTime || ""}
              onChange={(e) => updateField("wakeTime", e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* 深睡时长 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">深睡时长</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.deepSleep ?? ""}
              onChange={(e) => updateField("deepSleep", e.target.value ? parseFloat(e.target.value) : null)}
              className="col-span-3"
              placeholder="小时"
            />
          </div>

          {/* 浅睡时长 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">浅睡时长</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.lightSleep ?? ""}
              onChange={(e) => updateField("lightSleep", e.target.value ? parseFloat(e.target.value) : null)}
              className="col-span-3"
              placeholder="小时"
            />
          </div>

          {/* REM 时长 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">REM 时长</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.remSleep ?? ""}
              onChange={(e) => updateField("remSleep", e.target.value ? parseFloat(e.target.value) : null)}
              className="col-span-3"
              placeholder="小时"
            />
          </div>

          {/* 清醒次数 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">清醒次数</label>
            <Input
              type="number"
              min="0"
              value={formData.awakeCount ?? ""}
              onChange={(e) => updateField("awakeCount", e.target.value ? parseInt(e.target.value) : null)}
              className="col-span-3"
              placeholder="次"
            />
          </div>

          {/* 睡眠评分 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">睡眠评分</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.sleepScore ?? ""}
              onChange={(e) => updateField("sleepScore", e.target.value ? parseInt(e.target.value) : null)}
              className="col-span-3"
              placeholder="0-100"
            />
          </div>

          {/* 心率 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">心率</label>
            <Input
              type="number"
              min="30"
              max="200"
              value={formData.heartRate ?? ""}
              onChange={(e) => updateField("heartRate", e.target.value ? parseInt(e.target.value) : null)}
              className="col-span-3"
              placeholder="bpm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/sleep-record-dialog.tsx
git commit -m "feat: 创建睡眠记录对话框组件"
```

---

### Task 3: 修改首页添加入口

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 添加导入和状态**

在文件顶部导入后添加：

```typescript
import { SleepRecordDialog } from "@/components/sleep-record-dialog";
```

在组件内状态声明后添加：

```typescript
  const [addDialogOpen, setAddDialogOpen] = useState(false);
```

- [ ] **Step 2: 在上传区域下方添加入口**

在上传卡片 `</Card>` 标签后，Features 区域前添加：

```typescript
          {/* Manual Add Entry */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            或{" "}
            <button
              onClick={() => {
                if (!user) {
                  toast.error("请先登录");
                  router.push("/login");
                  return;
                }
                setAddDialogOpen(true);
              }}
              className="text-primary hover:underline"
            >
              手动添加记录
            </button>
          </p>

          {/* Add Record Dialog */}
          <SleepRecordDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onSuccess={() => router.push("/history")}
          />
```

- [ ] **Step 3: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: 首页添加手动记录入口"
```

---

### Task 4: 修改历史记录页面添加编辑删除功能

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: 添加导入**

在文件顶部添加：

```typescript
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SleepRecordDialog } from "@/components/sleep-record-dialog";
```

- [ ] **Step 2: 添加状态**

在现有状态声明后添加：

```typescript
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
```

- [ ] **Step 3: 添加编辑和删除处理函数**

在 `handleDeleteReport` 函数后添加：

```typescript
  const handleEditRecord = (record: SleepRecord) => {
    setSelectedRecord({
      ...record,
      bedTime: record.bedTime ? new Date(record.bedTime).toTimeString().slice(0, 5) : undefined,
      wakeTime: record.wakeTime ? new Date(record.wakeTime).toTimeString().slice(0, 5) : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteRecord = (record: SleepRecord) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!selectedRecord) return;

    setDeletingId(selectedRecord.id);
    try {
      const res = await fetch(`/api/sleep-records/${selectedRecord.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }

      toast.success("记录已删除");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败");
    } finally {
      setDeletingId(null);
      setSelectedRecord(null);
    }
  };
```

- [ ] **Step 4: 在表格中添加操作列**

在表格 `<thead>` 的最后一列后添加：

```typescript
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                              操作
                            </th>
```

在表格 `<tbody>` 的每行末尾添加：

```typescript
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditRecord(record);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRecord(record);
                                    }}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
```

- [ ] **Step 5: 在组件末尾添加对话框**

在 `</div>` 结束标签前添加：

```typescript
      {/* Edit Record Dialog */}
      <SleepRecordDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        record={selectedRecord}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条睡眠记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              disabled={deletingId === selectedRecord?.id}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingId === selectedRecord?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                "删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
```

- [ ] **Step 6: 更新 SleepRecord 接口添加缺失字段**

更新接口定义：

```typescript
interface SleepRecord {
  id: string;
  date: string;
  sleepDuration: number;
  deepSleep: number | null;
  lightSleep: number | null;
  remSleep: number | null;
  sleepScore: number | null;
  bedTime?: string;
  wakeTime?: string;
  awakeCount?: number | null;
  heartRate?: number | null;
}
```

- [ ] **Step 7: 提交**

```bash
git add src/app/history/page.tsx
git commit -m "feat: 历史记录页面添加编辑删除功能"
```

---

### Task 5: 验证功能

- [ ] **Step 1: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: 手动测试验收标准**

1. 首页显示手动添加记录入口
2. 点击入口弹出添加记录对话框
3. 对话框包含所有字段，日期和时长为必填
4. 保存后记录出现在历史记录列表
5. 历史记录表格每行显示编辑/删除按钮
6. 编辑按钮打开预填充数据的对话框
7. 删除按钮弹出确认对话框
8. 删除后记录从列表消失

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: 完成睡眠记录增删改查功能"
```
