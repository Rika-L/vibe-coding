'use client';

import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string | null;
  deletingId: string | null;
  onConfirm: () => void;
}

export function DeleteReportDialog({
  open,
  onOpenChange,
  reportId,
  deletingId,
  onConfirm,
}: DeleteReportDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center pt-6 pb-2">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-7 w-7 text-destructive" />
          </div>
          <AlertDialogHeader className="items-center text-center">
            <AlertDialogTitle className="text-xl">确认删除报告？</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              删除后将无法恢复，该报告的所有数据将被永久移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deletingId === reportId}
            className="w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
          >
            {deletingId === reportId
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
  );
}

interface DeleteRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string | null;
  deletingId: string | null;
  onConfirm: () => void;
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  recordId,
  deletingId,
  onConfirm,
}: DeleteRecordDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center pt-6 pb-2">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-7 w-7 text-destructive" />
          </div>
          <AlertDialogHeader className="items-center text-center">
            <AlertDialogTitle className="text-xl">确认删除记录？</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              确定要删除这条睡眠记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deletingId === recordId}
            className="w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
          >
            {deletingId === recordId
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
  );
}

interface BatchDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  deletingId: string | null;
  onConfirm: () => void;
}

export function BatchDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  deletingId,
  onConfirm,
}: BatchDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
              <span className="font-medium text-destructive">{selectedCount}</span>
              {' '}
              条睡眠记录，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
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
  );
}

interface ClearAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  confirmText: string;
  deletingId: string | null;
  onConfirmTextChange: (text: string) => void;
  onConfirm: () => void;
}

export function ClearAllDialog({
  open,
  onOpenChange,
  totalCount,
  confirmText,
  deletingId,
  onConfirmTextChange,
  onConfirm,
}: ClearAllDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
              <span className="font-medium text-destructive">{totalCount}</span>
              {' '}
              条睡眠记录，且无法恢复！
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <div className="px-6 pb-4">
          <input
            type="text"
            value={confirmText}
            onChange={e => onConfirmTextChange(e.target.value)}
            placeholder='请输入"确认清空"'
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <AlertDialogCancel
            className="w-full sm:w-auto"
            onClick={() => onConfirmTextChange('')}
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
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
  );
}
