import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Archive, 
  Settings,
  Plane
} from 'lucide-react';
import { View, Trainee } from '../../types';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  activeTrainee: Trainee;
}

const navItems = [
  { id: 'trainees', label: '훈련생 관리', icon: Users },
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'logs', label: '훈련 기록', icon: BookOpen },
  { id: 'evaluation', label: '역량 평가', icon: ClipboardCheck },
  { id: 'archive', label: '아카이브', icon: Archive },
  { id: 'settings', label: '설정', icon: Settings },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, activeTrainee }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-slate-900 p-2 rounded-lg">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">서울 APP/ARR</h1>
          <p className="text-[10px] text-slate-500 font-medium mt-1">CBT 관리 시스템</p>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-slate-100 mb-2">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <img 
            src={activeTrainee.avatar} 
            alt={activeTrainee.name} 
            className="w-10 h-10 rounded-full object-cover border border-slate-200" 
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{activeTrainee.name}</p>
            <p className="text-xs text-slate-500 truncate font-medium">선택된 훈련생</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
