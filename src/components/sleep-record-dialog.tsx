'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Loader2, Moon, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { sleepRecordSchema, type SleepRecordInput } from '@/lib/validations/auth';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SleepRecord>({
    date: format(new Date(), 'yyyy-MM-dd'),
    sleepDuration: 7,
    bedTime: '23:00',
    wakeTime: '07:00',
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
        bedTime: record.bedTime || '23:00',
        wakeTime: record.wakeTime || '07:00',
      });
    }
    else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        sleepDuration: 7,
        bedTime: '23:00',
        wakeTime: '07:00',
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
    const result = sleepRecordSchema.safeParse(formData as SleepRecordInput);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('请检查表单中的错误');
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const url = isEdit ? `/api/sleep-records/${record?.id}` : '/api/sleep-records';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '操作失败');
        return;
      }

      toast.success(isEdit ? '记录已更新' : '记录已添加');
      onOpenChange(false);
      onSuccess();
    }
    catch {
      toast.error('操作失败，请重试');
    }
    finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SleepRecord, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            {isEdit ? '编辑睡眠记录' : '添加睡眠记录'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? '修改睡眠记录信息' : '手动添加一条睡眠记录'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 日期 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              日期
              {' '}
              <span className="text-destructive">*</span>
            </label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger render={
                  <Button variant="outline" className="w-full justify-start text-left font-normal" />
                }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(new Date(formData.date), 'yyyy年MM月dd日', { locale: zhCN }) : '选择日期'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={date => date && updateField('date', format(date, 'yyyy-MM-dd'))}
                    disabled={date => date > new Date()}
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="mt-1 text-sm text-destructive">{errors.date}</p>
              )}
            </div>
          </div>

          {/* 睡眠时长 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              睡眠时长
              {' '}
              <span className="text-destructive">*</span>
            </label>
            <div className="col-span-3">
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.sleepDuration}
                onChange={e => updateField('sleepDuration', parseFloat(e.target.value) || 0)}
                className={errors.sleepDuration ? 'border-destructive' : ''}
                placeholder="小时"
              />
              {errors.sleepDuration && (
                <p className="mt-1 text-sm text-destructive">{errors.sleepDuration}</p>
              )}
            </div>
          </div>

          {/* 入睡时间 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">入睡时间</label>
            <Input
              type="time"
              value={formData.bedTime || ''}
              onChange={e => updateField('bedTime', e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* 起床时间 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">起床时间</label>
            <Input
              type="time"
              value={formData.wakeTime || ''}
              onChange={e => updateField('wakeTime', e.target.value)}
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
              value={formData.deepSleep ?? ''}
              onChange={e => updateField('deepSleep', e.target.value ? parseFloat(e.target.value) : null)}
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
              value={formData.lightSleep ?? ''}
              onChange={e => updateField('lightSleep', e.target.value ? parseFloat(e.target.value) : null)}
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
              value={formData.remSleep ?? ''}
              onChange={e => updateField('remSleep', e.target.value ? parseFloat(e.target.value) : null)}
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
              value={formData.awakeCount ?? ''}
              onChange={e => updateField('awakeCount', e.target.value ? parseInt(e.target.value) : null)}
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
              value={formData.sleepScore ?? ''}
              onChange={e => updateField('sleepScore', e.target.value ? parseInt(e.target.value) : null)}
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
              value={formData.heartRate ?? ''}
              onChange={e => updateField('heartRate', e.target.value ? parseInt(e.target.value) : null)}
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
            {loading
              ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                )
              : (
                  '保存'
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
