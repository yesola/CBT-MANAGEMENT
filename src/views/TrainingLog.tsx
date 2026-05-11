import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  User
} from 'lucide-react';
import { SECTORS } from '../constants';
import { cn } from '../lib/utils';
import { Trainee, TrainingLogEntry } from '../types';

interface TrainingLogProps {
  trainee: Trainee;
  history: TrainingLogEntry[];
  onAddLog: (log: Omit<TrainingLogEntry, 'id'>) => void;
}

export const TrainingLog: React.FC<TrainingLogProps> = ({ trainee, history: allHistory, onAddLog }) => {
  // Assume we are viewing the records of the selected trainee
  const history = allHistory.filter(h => h.traineeId === trainee.id);

  const [showEntryForm, setShowEntryForm] = useState(false);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:30');
  const [station, setStation] = useState('APP E');
  const [instructor, setInstructor] = useState('Kim, M.');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);

    setTimeout(() => {
      onAddLog({
        traineeId: trainee.id,
        date,
        startTime,
        endTime,
        duration,
        station,
        instructor,
        topic: '현장 업무 실습',
        category: '현장 업무 훈련 (OJT)',
        remarks,
        comments: '훈련 세션 기록됨',
        rating: 4
      });
      setIsSubmitting(false);
      setShowEntryForm(false);
      setRemarks('');
      alert('훈련 세션이 성공적으로 기록되었습니다!');
    }, 800);
  };

  // Sector definitions with targets
  const SECTOR_CONFIGS = [
    { name: 'APP E', target: 60, color: 'bg-blue-400' },
    { name: 'APP W', target: 60, color: 'bg-blue-400' },
    { name: 'ARR E', target: 60, color: 'bg-sky-400' },
    { name: 'ARR W', target: 60, color: 'bg-sky-400' },
    { name: 'APP G', target: 40, color: 'bg-emerald-400' },
    { name: 'IC DEP', target: 40, color: 'bg-indigo-400' },
    { name: 'GP DEP', target: 40, color: 'bg-indigo-400' },
    { name: 'K-16', target: 40, color: 'bg-rose-400' },
  ];

  const sectorProgressData = SECTOR_CONFIGS.map(config => {
    const hours = history
      .filter(h => h.station === config.name)
      .reduce((acc, curr) => acc + curr.duration, 0) / 60;
    
    return {
      ...config,
      current: hours,
      percentage: Math.min((hours / config.target) * 100, 100)
    };
  }).filter(() => true); // Show all sectors as requested

  const totalHours = history.reduce((acc, curr) => acc + curr.duration, 0) / 60;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">훈련 기록 히스토리</h2>
          <p className="text-slate-500 mt-1">일일 현장 업무 훈련 시간을 기록하고 검토합니다.</p>
        </div>
        <button 
          onClick={() => setShowEntryForm(true)}
          className="bg-[#0e5c8e] hover:bg-[#0a4a75] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          신규 기록 추가
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded text-sm font-medium border border-slate-200">
          <Filter className="w-4 h-4" />
          필터
        </button>

        <select className="bg-white border border-slate-200 rounded px-3 py-2 text-sm font-medium text-slate-600 min-w-[150px] appearance-none focus:ring-1 focus:ring-blue-500">
          <option>최근 30일</option>
          <option>최근 분기</option>
          <option>전체 기간</option>
        </select>

        <select className="bg-white border border-slate-200 rounded px-3 py-2 text-sm font-medium text-slate-600 min-w-[150px] appearance-none focus:ring-1 focus:ring-blue-500">
          <option>모든 근무석</option>
          {SECTORS.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select className="bg-white border border-slate-200 rounded px-3 py-2 text-sm font-medium text-slate-600 min-w-[150px] appearance-none focus:ring-1 focus:ring-blue-500">
          <option>모든 교관</option>
        </select>

        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="비고 검색..." 
            className="w-full border border-slate-200 rounded py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table Container */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-tight">날짜</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-tight">시작</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-tight">종료</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-tight">소요 시간</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-tight">근무석</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-tight">교관</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-tight">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-nowrap">
                  {history.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-slate-800">{log.date}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{log.startTime}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{log.endTime}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">{(log.duration / 60).toFixed(1)}h</td>
                      <td className="px-5 py-4 text-sm">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100 uppercase">
                          {log.station}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{log.instructor}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 italic max-w-[200px] truncate">{log.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white text-xs font-medium text-slate-500">
              <p>{history.length}개 중 1~{history.length} 표시 중</p>
              <div className="flex gap-1">
                <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
                <button className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded font-bold">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">3</button>
                <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary Area */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-1 border border-slate-200 rounded">
                 <div className="animate-spin-slow">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-800 rounded-full" />
                </div>
              </div>
              <h4 className="font-bold text-lg text-slate-900 tracking-tight">근무석별 요약</h4>
            </div>
            
            <div className="space-y-6">
              {sectorProgressData.map((sector) => (
                <div key={sector.name} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <p className="text-[11px] font-bold text-slate-800 uppercase">{sector.name}</p>
                    <span className="text-[11px] font-bold text-slate-700">
                      {sector.current.toFixed(1)} / {sector.target}시간
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", sector.color)}
                      style={{ width: `${sector.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
                <span className="text-xs font-medium text-slate-500">총 훈련 시간</span>
                <span className="text-2xl font-bold text-slate-900 leading-none">{totalHours.toFixed(1)}시간</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] text-white p-6 rounded-lg shadow-md border border-slate-800">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-slate-700/50 p-2 rounded-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="font-bold text-lg leading-snug">평가 준비가 되었나요?</h4>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              필수 APP 시간의 50% 이상을 이수하셨습니다. 중간 역량 평가를 요청하세요.
            </p>
            <button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-lg font-bold text-sm transition-colors">
              평가 요청하기
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showEntryForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#0e5c8e] rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-900">신규 훈련 기록</h4>
                </div>
                <button onClick={() => setShowEntryForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">훈련 날짜</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">근무석 (Station)</label>
                    <select 
                      required
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="">근무석 선택</option>
                      {SECTORS.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">시작 시간</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">종료 시간</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">교관 (Instructor)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                      placeholder="교관 성명"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">비고 (통합 여부 등)</label>
                  <input 
                    type="text" 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="예: 통합, 특정 이동 룬련 등"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowEntryForm(false)}
                    className="flex-1 py-3 rounded-lg font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#0e5c8e] hover:bg-[#0a4a75] text-white rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "기록 중..." : "기록 저장"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
