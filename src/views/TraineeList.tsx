import React, { useState } from 'react';
import { Trainee } from '../types';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Clock,
  ExternalLink,
  Plus,
  X,
  Info,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TraineeListProps {
  trainees: Trainee[];
  onSelectTrainee: (id: string) => void;
  onAddTrainee: (trainee: Omit<Trainee, 'id' | 'avatar' | 'progress' | 'status' | 'lastSession'>) => void;
}

export const TraineeList: React.FC<TraineeListProps> = ({ trainees, onSelectTrainee, onAddTrainee }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    startDate: new Date().toISOString().split('T')[0],
    phase: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTrainee({
      name: formData.name,
      joinedDate: formData.startDate,
      unit: '',
      profileRemarks: '신규 등록'
    });
    alert('훈련생이 성공적으로 등록되었습니다!');
    setShowCreateModal(false);
    setFormData({
      name: '',
      dob: '',
      startDate: new Date().toISOString().split('T')[0],
      phase: '',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">훈련생 관리</h2>
          <p className="text-slate-500 mt-1">전문 관제사 양성 과정을 모니터링하고 관리합니다.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#1e293b] hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          신규 등록
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="훈련생 검색..." 
            className="w-full border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded border border-slate-200 text-sm font-medium">
            <Filter className="w-4 h-4" />
            필터
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trainees.map((trainee, index) => (
          <motion.div
            key={trainee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectTrainee(trainee.id)}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <img 
                    src={trainee.avatar} 
                    alt={trainee.name} 
                    className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
                    trainee.status === 'active' ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-all">{trainee.name}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Trainee Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">신규 훈련생 등록</h4>
                  <p className="text-xs text-slate-500 mt-0.5">CBT 프로그램을 위한 새로운 관제사를 등록합니다.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">성명</label>
                  <input 
                    type="text" 
                    required
                    placeholder="훈련생의 실명을 입력하세요"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">생년월일</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        required
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium appearance-none"
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">훈련 시작일</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        required
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium appearance-none"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                    훈련생은 교관 대시보드에 자동으로 추가됩니다. 초기 역량 기록은 비어 있는 상태로 생성됩니다.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#1e293b] hover:bg-slate-800 text-white rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95"
                  >
                    훈련생 생성
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
