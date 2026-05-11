import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Target,
  Calendar,
  PlusCircle,
  X,
  User,
  Info,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';
import { SECTORS, PROFILE_AVATARS } from '../constants';
import { cn } from '../lib/utils';
import { Trainee, TrainingLogEntry, CompetencyEvaluation } from '../types';

const SECTOR_COLORS: Record<string, string> = {
  'APP E': '#3b82f6', // blue
  'APP W': '#06b6d4', // cyan
  'ARR E': '#8b5cf6', // purple
  'ARR W': '#f43f5e', // rose
  'APP G': '#f59e0b', // amber
  'IC DEP': '#10b981', // emerald
  'GP DEP': '#ec4899', // pink
  'K-16': '#64748b', // slate
};

interface DashboardProps {
  trainee: Trainee;
  trainees: Trainee[];
  history: TrainingLogEntry[];
  evaluations: CompetencyEvaluation[];
  onSelectTrainee: (id: string) => void;
  onAddLog: (log: Omit<TrainingLogEntry, 'id'>) => void;
  onUpdateLog: (id: string, log: Omit<TrainingLogEntry, 'id'>) => void;
  onDeleteLog: (id: string) => void;
  onUpdateTrainee: (id: string, updatedInfo: Partial<Trainee>) => void;
  onViewEvaluation?: (evaluation: CompetencyEvaluation) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  trainee, 
  trainees, 
  history: allHistory, 
  evaluations: allEvaluations,
  onSelectTrainee, 
  onAddLog, 
  onUpdateLog,
  onDeleteLog,
  onUpdateTrainee,
  onViewEvaluation
}) => {
  const history = allHistory.filter(h => h.traineeId === trainee.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const evaluations = [...allEvaluations]
    .filter(e => e.traineeId === trainee.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    station: 'APP E',
    instructor: '',
    topic: '',
    remarks: '',
  });

  const [profileFormData, setProfileFormData] = useState({
    name: trainee.name,
    joinedDate: trainee.joinedDate,
    unit: trainee.unit,
    profileRemarks: trainee.profileRemarks,
    birthDate: trainee.birthDate || '',
    avatar: trainee.avatar,
  });

  // Update profile form data when trainee changes
  React.useEffect(() => {
    setProfileFormData({
      name: trainee.name,
      joinedDate: trainee.joinedDate,
      unit: trainee.unit,
      profileRemarks: trainee.profileRemarks,
      birthDate: trainee.birthDate || '',
      avatar: trainee.avatar,
    });
  }, [trainee]);

  const totalHours = history.reduce((acc, curr) => acc + curr.duration, 0) / 60;
  
  // Group by date for stacked volume chart
  const groupedByDate: Record<string, TrainingLogEntry[]> = {};
  history.forEach(log => {
    if (!groupedByDate[log.date]) {
      groupedByDate[log.date] = [];
    }
    groupedByDate[log.date].push(log);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => a.localeCompare(b));
  const last7Dates = sortedDates.slice(-7);

  const volumeData = last7Dates.map(date => {
    const logs = groupedByDate[date];
    const dataEntry: any = {
      name: date.split('-').slice(1).join('/'),
      date: date // keep full date for reference
    };
    logs.forEach(log => {
      const hours = parseFloat((log.duration / 60).toFixed(1));
      dataEntry[log.station] = (dataEntry[log.station] || 0) + hours;
    });
    return dataEntry;
  });

  const sectorProgress = SECTORS.map(sector => {
    const hours = history
      .filter(log => log.station === sector.id)
      .reduce((acc, curr) => acc + curr.duration, 0) / 60;
    const required = (sector as any).requiredHours || 200;
    const progress = Math.min(100, (hours / required) * 100);
    return {
      ...sector,
      hours,
      required,
      progress
    };
  });

  const overallProgress = (sectorProgress.reduce((acc, curr) => acc + curr.hours, 0) / sectorProgress.reduce((acc, curr) => acc + curr.required, 0)) * 100;

  // Monthly average calculation
  const monthlyLogs: Record<string, number> = {};
  history.forEach(log => {
    const month = log.date.substring(0, 7); // YYYY-MM
    monthlyLogs[month] = (monthlyLogs[month] || 0) + (log.duration / 60);
  });
  const monthsCount = Object.keys(monthlyLogs).length;
  const avgMonthlyHours = monthsCount > 0 
    ? Object.values(monthlyLogs).reduce((a, b) => a + b, 0) / monthsCount 
    : 0;

  // Calculate growth trend
  const sortedMonths = Object.keys(monthlyLogs).sort((a, b) => b.localeCompare(a));
  const latestMonth = sortedMonths[0];
  const latestHours = latestMonth ? monthlyLogs[latestMonth] : 0;
  
  let previousHours = 0;
  if (latestMonth) {
    const [year, month] = latestMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const prevMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    previousHours = monthlyLogs[prevMonthKey] || 0;
  }
  
  const growthPercent = previousHours > 0 
    ? ((latestHours - previousHours) / previousHours) * 100 
    : (latestHours > 0 ? 100 : 0);

  const latestEval = evaluations[0];
  
  const radarData = latestEval ? [
    { subject: '상황인식', A: latestEval.situationalAwareness },
    { subject: '교통상황관리', A: latestEval.trafficManagement },
    { subject: '분리/충돌해결', A: latestEval.separationConflict },
    { subject: '의사소통', A: latestEval.communication },
    { subject: '협조', A: latestEval.cooperation },
    { subject: '자기관리', A: latestEval.selfManagement },
  ] : [];

  const stats = [
    { label: '섹터별 시간 현황', value: `${overallProgress.toFixed(1)}%`, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50', subValue: `${totalHours.toFixed(1)} / ${sectorProgress.reduce((acc, curr) => acc + curr.required, 0)} 시간` },
    { label: '월간 평균 시간', value: `${avgMonthlyHours.toFixed(1)} 시간`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateTrainee(trainee.id, {
        name: profileFormData.name,
        joinedDate: profileFormData.joinedDate,
        unit: profileFormData.unit,
        profileRemarks: profileFormData.profileRemarks,
        birthDate: profileFormData.birthDate,
        avatar: profileFormData.avatar,
      });
      setIsSubmitting(false);
      setShowProfileModal(false);
      alert('프로필이 성공적으로 수정되었습니다!');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);

    setTimeout(() => {
      const logData = {
        traineeId: trainee.id,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration,
        station: formData.station,
        instructor: formData.instructor,
        topic: formData.topic || '현장 업무 실습',
        remarks: formData.remarks,
        comments: '성공적으로 세션을 마침',
        rating: 4
      };

      if (editingLogId) {
        onUpdateLog(editingLogId, logData);
        alert('훈련 기록이 성공적으로 수정되었습니다!');
      } else {
        onAddLog(logData);
        alert('훈련 기록이 성공적으로 추가되었습니다!');
      }
      
      setIsSubmitting(false);
      setShowLogModal(false);
      setEditingLogId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        station: 'APP E',
        instructor: '',
        topic: '',
        remarks: '',
      });
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-12">
      {/* Profile Card - New Design */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border border-slate-200 p-1 bg-white shadow-sm overflow-hidden flex items-center justify-center">
              <img 
                src={trainee.avatar} 
                alt={trainee.name} 
                className="w-full h-full rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <div className="relative inline-block">
                <select 
                  value={trainee.id}
                  onChange={(e) => onSelectTrainee(e.target.value)}
                  className="appearance-none bg-transparent pr-8 text-3xl font-bold text-slate-900 tracking-tight cursor-pointer hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {trainees.map(t => (
                    <option key={t.id} value={t.id} className="text-base font-medium">
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              setEditingLogId(null);
              setShowLogModal(true);
            }}
            className="bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95 group"
          >
            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            훈련 기록 추가
          </button>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 border-b-2"
          >
            프로필 수정
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Sector Status Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">섹터별 시간 현황</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{overallProgress.toFixed(1)}%</span>
                  <span className="text-sm font-bold text-slate-400">{totalHours.toFixed(1)} / {sectorProgress.reduce((acc, curr) => acc + curr.required, 0)} 시간</span>
                </div>
              </div>
            </div>
            
            <div className="w-64 pt-2">
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-sm shadow-blue-200" 
                  style={{ width: `${overallProgress}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
            {sectorProgress.map(s => (
              <div key={s.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-800 tracking-tight">{s.id}</span>
                  <span className="text-[10px] font-bold text-blue-600">
                    {s.hours.toFixed(1)}<span className="text-slate-300 mx-0.5">/</span>{s.required}h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${s.progress}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 w-8 text-right px-0.5">{s.progress.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Stats Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 text-amber-500 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">월간 평균 시간</p>
              <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{avgMonthlyHours.toFixed(1)} 시간</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">지난달 대비</span>
              <span className={cn(
                "text-xs font-bold flex items-center gap-1",
                growthPercent >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {growthPercent >= 0 ? <PlusCircle className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 rotate-90" />}
                {Math.abs(growthPercent).toFixed(1)}% {growthPercent >= 0 ? '증가' : '감소'}
              </span>
            </div>
          </div>
          

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">훈련량 (최근 7회 세션)</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end">
                {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
                  <div key={sector} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[9px] font-bold text-slate-400 tracking-tight uppercase">{sector}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    label={{ value: '시간 (Hours)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fontWeight: 600, fill: '#94a3b8' } }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{data.name}</p>
                            <div className="space-y-1">
                              {payload.map((p: any) => {
                                if (p.value > 0) {
                                  return (
                                    <div key={p.name} className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                                        <span className="text-xs font-bold text-slate-700">{p.name}</span>
                                      </div>
                                      <span className="text-xs font-bold text-blue-600">{p.value}시간</span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {SECTORS.map((s, index) => (
                    <Bar 
                      key={s.id} 
                      dataKey={s.id} 
                      stackId="a" 
                      fill={SECTOR_COLORS[s.id]} 
                      barSize={32}
                      radius={index === SECTORS.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    >
                      <LabelList 
                        dataKey={s.id} 
                        content={(props: any) => {
                          const { x, y, width, height, value } = props;
                          if (value && value > 0.5) {
                            return (
                              <text 
                                x={x + width / 2} 
                                y={y + height / 2} 
                                fill="#fff" 
                                textAnchor="middle" 
                                dominantBaseline="middle" 
                                style={{ fontSize: 8, fontWeight: 900, pointerEvents: 'none' }}
                              >
                                {s.id}
                              </text>
                            );
                          }
                          return null;
                        }} 
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">최근 세션</h3>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700">전체 보기</button>
            </div>
            <div className="space-y-4">
              {history.slice(0, 3).map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-900">{log.date}</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{log.station}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{log.topic}</p>
                  <p className="text-xs text-slate-400 mt-1">Instructor: {log.instructor}</p>
                  
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingLogId(log.id);
                        setFormData({
                          date: log.date,
                          startTime: log.startTime,
                          endTime: log.endTime,
                          station: log.station,
                          instructor: log.instructor,
                          topic: log.topic,
                          remarks: log.remarks || '',
                        });
                        setShowLogModal(true);
                      }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 shadow-sm"
                      title="수정"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(log.id)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 shadow-sm"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Competency & Evaluation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart Box */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              핵심 역량 분석
            </h3>
            {latestEval && (
              <span className="text-xs font-bold text-slate-400">최근 평가: {latestEval.date}</span>
            )}
          </div>
          
          <div className="h-[400px] w-full">
            {latestEval ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                  <Radar
                    name="Proficiency"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                    strokeWidth={3}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-lg text-[11px] font-bold">
                            {payload[0].payload.subject}: {payload[0].value}%
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <FileText className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">등록된 역량 평가 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructor Notes Box */}
        <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-8">종합 교관 의견</h3>
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] pr-2 custom-scrollbar">
            {evaluations.length > 0 ? (
              evaluations.map((ev, idx) => (
                <div key={ev.id} className={cn(
                  "p-5 rounded-2xl border transition-all",
                  idx === 0 ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-black text-slate-900">{ev.date}</span>
                    <span className="text-[10px] font-bold text-slate-400">교관: {ev.evaluator}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{ev.details || '의견이 작성되지 않았습니다.'}"
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 italic">
                <Info className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">작성된 교관 의견이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation History Table */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">역량 평가 이력</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">평가 일자</th>
                  <th className="px-8 py-4">평가 구분</th>
                  <th className="px-8 py-4 text-center">종합 점수</th>
                  <th className="px-8 py-4 text-center">결과</th>
                  <th className="px-8 py-4">평가자</th>
                  <th className="px-8 py-4 text-right">상세보기</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{ev.date}</td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900">{ev.category}</td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-white font-black text-xs">
                        {typeof ev.score === 'number' ? ev.score.toFixed(1) : ev.score}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold",
                        ev.result === 'satisfactory' ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" :
                        ev.result === 'marginal' ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" :
                        "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                      )}>
                        {ev.result === 'satisfactory' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {ev.result === 'satisfactory' ? '만족' : ev.result === '부분' ? '부분' : '부족'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{ev.evaluator}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => onViewEvaluation?.(ev)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {evaluations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium text-sm">
                      평가 이력이 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">프로필 수정</h4>
                    <p className="text-xs text-slate-500 font-medium">관제사 정보를 업데이트합니다.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)} 
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">프로필 사진 선택</label>
                  
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">여성 아바타</p>
                    <div className="flex flex-wrap gap-2">
                      {PROFILE_AVATARS.female.map((url, idx) => (
                        <button
                          key={`female-${idx}`}
                          type="button"
                          onClick={() => setProfileFormData({...profileFormData, avatar: url})}
                          className={cn(
                            "w-12 h-12 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white",
                            profileFormData.avatar === url ? "border-blue-500 scale-110 shadow-md shadow-blue-100" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={url} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">남성 아바타</p>
                    <div className="flex flex-wrap gap-2">
                      {PROFILE_AVATARS.male.map((url, idx) => (
                        <button
                          key={`male-${idx}`}
                          type="button"
                          onClick={() => setProfileFormData({...profileFormData, avatar: url})}
                          className={cn(
                            "w-12 h-12 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white",
                            profileFormData.avatar === url ? "border-blue-500 scale-110 shadow-md shadow-blue-100" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={url} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">성명</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="관제사 성명"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                      value={profileFormData.name}
                      onChange={(e) => setProfileFormData({...profileFormData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">훈련 시작일</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                      value={profileFormData.joinedDate}
                      onChange={(e) => setProfileFormData({...profileFormData, joinedDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">생년월일</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                      value={profileFormData.birthDate}
                      onChange={(e) => setProfileFormData({...profileFormData, birthDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">참고사항</label>
                  <input 
                    type="text" 
                    placeholder="예: 훈련 특이사항, 선호 시간 등"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    value={profileFormData.profileRemarks}
                    onChange={(e) => setProfileFormData({...profileFormData, profileRemarks: e.target.value})}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                    변경된 정보는 대시보드와 모든 리포트 문서에 즉시 반영됩니다.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>업데이트</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Entry Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                    <PlusCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{editingLogId ? '훈련 기록 수정' : '훈련 기록 추가'}</h4>
                    <p className="text-xs text-slate-500 font-medium">{editingLogId ? '기존 기록을 수정합니다.' : `훈련생: ${trainee.name}`}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">훈련 날짜</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input 
                        type="date" 
                        required
                        value={formData.date}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">근무석 (Station)</label>
                    <select 
                      required
                      value={formData.station}
                      onChange={(e) => setFormData({...formData, station: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="">근무석 선택</option>
                      {SECTORS.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">시작 시간</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input 
                        type="time" 
                        required
                        value={formData.startTime}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">종료 시간</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input 
                        type="time" 
                        required
                        value={formData.endTime}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">교관 (Instructor)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="교관 이름"
                      value={formData.instructor}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">훈련 비고 (통합 여부 등)</label>
                  <input 
                    type="text" 
                    placeholder="예: 통합, 특정 절차 훈련 등"
                    value={formData.remarks}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                    입력하신 시간은 자동으로 계산되어 누적 훈련 시간에 반영됩니다. 종료 시간은 시작 시간보다 늦어야 합니다.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>{editingLogId ? '수정 완료' : '저장하기'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">기록 삭제</h3>
                <p className="text-sm text-slate-500 mt-2">
                  정말로 이 훈련 기록을 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.
                </p>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    if (deleteConfirmId) {
                      onDeleteLog(deleteConfirmId);
                      setDeleteConfirmId(null);
                      alert('훈련 기록이 삭제되었습니다.');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-95"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

