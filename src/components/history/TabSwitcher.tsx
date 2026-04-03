'use client';

import { Moon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'records' | 'reports';

interface TabSwitcherProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function TabSwitcher({ activeTab, setActiveTab }: TabSwitcherProps) {
  return (
    <div className="mb-6 flex gap-2">
      <Button variant={activeTab === 'records' ? 'default' : 'outline'} onClick={() => setActiveTab('records')} className="gap-2">
        <Moon className="h-4 w-4" /> 睡眠记录
      </Button>
      <Button variant={activeTab === 'reports' ? 'default' : 'outline'} onClick={() => setActiveTab('reports')} className="gap-2">
        <Sparkles className="h-4 w-4" /> AI 分析报告
      </Button>
    </div>
  );
}

export type { TabType };
