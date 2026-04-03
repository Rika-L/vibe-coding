'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SleepRecordDialog } from '@/components/sleep-record-dialog';
import { SleepRecord } from '@/lib/types';
import {
  HistoryFilters,
  RecordsTab,
  ReportsTab,
  DeleteReportDialog,
  DeleteRecordDialog,
  BatchDeleteDialog,
  ClearAllDialog,
  HistoryHeader,
  HistoryLoadingState,
  HistoryErrorState,
  TabSwitcher,
  type TabType,
} from '@/components/history';

interface AnalysisReport {
  id: string;
  title: string;
  summary: string;
  sleepQuality: string;
  dataRange: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [userInfo, setUserInfo] = useState<{ name: string | null; avatar: string | null } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoadError(false);
      const params = new URLSearchParams({ page: pagination.page.toString(), pageSize: pagination.pageSize.toString() });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await fetch(`/api/sleep-history?${params}`);
      if (!res.ok) { if (res.status === 401) { router.push('/login?redirect=/history'); return; } throw new Error('网络请求失败'); }
      const data = await res.json();
      setRecords(data.records || []);
      setPagination(prev => ({ ...prev, total: data.pagination.total, totalPages: data.pagination.totalPages }));
    } catch { setLoadError(true); } finally { setLoading(false); setFiltering(false); }
  }, [pagination.page, pagination.pageSize, startDate, endDate, router]);

  const fetchReports = useCallback(async () => {
    try {
      setLoadError(false);
      const res = await fetch(`/api/reports?page=${pagination.page}&pageSize=10`);
      if (!res.ok) { if (res.status === 401) { router.push('/login?redirect=/history'); return; } throw new Error('网络请求失败'); }
      const data = await res.json();
      setReports(data.reports || []);
      setPagination(prev => ({ ...prev, total: data.pagination.total, totalPages: data.pagination.totalPages }));
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, [pagination.page, router]);

  useEffect(() => { setLoading(true); activeTab === 'records' ? fetchData() : fetchReports(); }, [activeTab, fetchData, fetchReports]);
  useEffect(() => { fetch('/api/user/profile').then(res => res.ok ? res.json() : null).then(d => d?.user && setUserInfo(d.user)).catch(() => {}); }, []);

  const handleLogout = async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); toast.success('已登出'); router.push('/login'); } catch { toast.error('登出失败'); } };
  const handlePageChange = (newPage: number) => setPagination(prev => ({ ...prev, page: newPage }));
  const handleFilter = () => { setPagination(prev => ({ ...prev, page: 1 })); setFiltering(true); setLoading(true); };
  const clearFilter = () => { setStartDate(''); setEndDate(''); setPagination(prev => ({ ...prev, page: 1 })); setFiltering(true); setLoading(true); fetchData(); };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    setDeletingId(reportToDelete);
    try { const res = await fetch(`/api/reports/${reportToDelete}`, { method: 'DELETE' }); if (!res.ok) throw new Error((await res.json()).error || '删除失败'); toast.success('报告已删除'); fetchReports(); } catch (e) { toast.error(e instanceof Error ? e.message : '删除失败'); } finally { setDeletingId(null); setReportToDelete(null); }
  };

  const handleEditRecord = (record: SleepRecord) => { setSelectedRecord({ ...record, bedTime: record.bedTime ? new Date(record.bedTime).toTimeString().slice(0, 5) : undefined, wakeTime: record.wakeTime ? new Date(record.wakeTime).toTimeString().slice(0, 5) : undefined }); setEditDialogOpen(true); };
  const handleSelectOne = (id: string) => { setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }); };
  const handleSelectAll = () => { if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); } else { setSelectedIds(new Set(records.map(r => r.id))); setSelectAll(true); } };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return; setDeletingId('batch');
    try { const res = await fetch('/api/sleep-records', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selectedIds) }) }); if (!res.ok) throw new Error((await res.json()).error || '删除失败'); toast.success(`已删除 ${selectedIds.size} 条记录`); setSelectedIds(new Set()); setSelectAll(false); setBatchDeleteDialogOpen(false); fetchData(); } catch (e) { toast.error(e instanceof Error ? e.message : '删除失败'); } finally { setDeletingId(null); }
  };

  const handleClearAll = async () => {
    if (confirmText !== '确认清空') return; setDeletingId('clear');
    try { const res = await fetch('/api/sleep-records?all=true', { method: 'DELETE' }); if (!res.ok) throw new Error((await res.json()).error || '清空失败'); toast.success('已清空所有记录'); setSelectedIds(new Set()); setSelectAll(false); setClearAllDialogOpen(false); setConfirmText(''); fetchData(); } catch (e) { toast.error(e instanceof Error ? e.message : '清空失败'); } finally { setDeletingId(null); }
  };

  const confirmDeleteRecord = async () => {
    if (!selectedRecord) return; setDeletingId(selectedRecord.id);
    try { const res = await fetch(`/api/sleep-records/${selectedRecord.id}`, { method: 'DELETE' }); if (!res.ok) throw new Error((await res.json()).error || '删除失败'); toast.success('记录已删除'); setDeleteRecordDialogOpen(false); fetchData(); } catch (e) { toast.error(e instanceof Error ? e.message : '删除失败'); } finally { setDeletingId(null); setSelectedRecord(null); }
  };

  if (loading) return <HistoryLoadingState />;
  if (loadError) return <HistoryErrorState onRetry={() => (activeTab === 'records' ? fetchData() : fetchReports())} />;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <HistoryHeader userInfo={userInfo} onLogout={handleLogout} onSettings={() => router.push('/settings')} />
      <main className="container mx-auto px-4 py-8">
        <TabSwitcher activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setPagination(prev => ({ ...prev, page: 1 })); }} />
        {activeTab === 'records' ? (
          <>
            <HistoryFilters startDate={startDate} endDate={endDate} filtering={filtering} totalRecords={pagination.total} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onFilter={handleFilter} onClear={clearFilter} />
            <RecordsTab records={records} pagination={pagination} selectedIds={selectedIds} selectAll={selectAll} deletingId={deletingId} onSelectOne={handleSelectOne} onSelectAll={handleSelectAll} onPageChange={handlePageChange} onEditRecord={handleEditRecord} onDeleteRecord={(r) => { setSelectedRecord(r); setDeleteRecordDialogOpen(true); }} onBatchDelete={() => setBatchDeleteDialogOpen(true)} onClearAll={() => setClearAllDialogOpen(true)} onAddRecord={() => { setSelectedRecord(null); setEditDialogOpen(true); }} />
          </>
        ) : (
          <ReportsTab reports={reports} pagination={pagination} deletingId={deletingId} onDeleteReport={(id) => { setReportToDelete(id); setDeleteDialogOpen(true); }} onPageChange={handlePageChange} />
        )}
      </main>
      <DeleteReportDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} reportId={reportToDelete} deletingId={deletingId} onConfirm={confirmDeleteReport} />
      <SleepRecordDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} record={selectedRecord} onSuccess={fetchData} />
      <DeleteRecordDialog open={deleteRecordDialogOpen} onOpenChange={setDeleteRecordDialogOpen} recordId={selectedRecord?.id ?? null} deletingId={deletingId} onConfirm={confirmDeleteRecord} />
      <BatchDeleteDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen} selectedCount={selectedIds.size} deletingId={deletingId} onConfirm={handleBatchDelete} />
      <ClearAllDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen} totalCount={pagination.total} confirmText={confirmText} deletingId={deletingId} onConfirmTextChange={setConfirmText} onConfirm={handleClearAll} />
    </div>
  );
}
