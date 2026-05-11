import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  HelpCircle,
  Save,
  Calendar,
  User,
  Shield,
  Zap,
  Users,
  MessageSquare,
  AlertCircle,
  Brain,
  Target,
  BarChart3,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Trainee, CompetencyEvaluation } from '../types';

interface CompetencyEvalProps {
  trainee: Trainee;
  onAddEvaluation?: (evaluation: Omit<CompetencyEvaluation, 'id'>) => void;
}

type Rating = 1 | 2 | 3 | 4; // 1: 부족, 2: 부분, 3: 만족, 4: 능통

interface CompetencyItem {
  id: number;
  title: string;
  enTitle: string;
  description: string;
  icon: any;
}

const COMPETENCIES: CompetencyItem[] = [
  { id: 1, title: '상황인식', enTitle: 'Situational Awareness', description: '현재 운영상황을 이해하고 미래상황을 예측하는 능력', icon: Brain },
  { id: 2, title: '교통상황 관리', enTitle: 'Traffic Management', description: '안전, 순서정연, 효율적인 교통흐름 유지 및 필요정보 제공', icon: Target },
  { id: 3, title: '분리 및 충돌 해결', enTitle: 'Separation & Conflict Resolution', description: '잠재적인 충돌상황을 관리하고 규정된 분리를 유지하는 능력', icon: Shield },
  { id: 4, title: '의사소통', enTitle: 'Communication', description: '표준 관제용어 사용 및 모든 운영상황에서 효율적인 의사소통', icon: MessageSquare },
  { id: 5, title: '협조', enTitle: 'Coordination', description: '관련 부서 및 다른 관제석과의 효율적인 업무 협조 및 정보 공유', icon: Users },
  { id: 6, title: '비정상 상황 관리', enTitle: 'Management of Non-routine Situations', description: '위협 또는 예치 못한 상황을 신속히 탐지하고 적절히 대응하는 능력', icon: Zap },
  { id: 7, title: '문제해결 및 의사결정', enTitle: 'Problem Solving & Decision-making', description: '운영상황의 정보를 분석하여 최선의 관제 결정을 내리는 능력', icon: HelpCircle },
  { id: 8, title: '자기관리', enTitle: 'Self-Management', description: '자기주도적 학습 및 훈련에 임하는 적극적인 자세와 태도', icon: User },
  { id: 9, title: '업무량 관리', enTitle: 'Workload Management', description: '업무 우선순위 설정 및 이용 가능한 자원을 효율적으로 활용하는 능력', icon: BarChart3 },
  { id: 10, title: '팀워크', enTitle: 'Teamwork', description: '팀의 일원으로서 동료들과 원활하게 소통하고 지원하며 역할을 수행', icon: Users },
];

export const CompetencyEval: React.FC<CompetencyEvalProps> = ({ trainee, onAddEvaluation }) => {
  const [evalDate, setEvalDate] = useState(new Date().toISOString().split('T')[0]);
  const [evaluator, setEvaluator] = useState('Lee, Seong-ho (I-082)');
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [overallComment, setOverallComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (id: number, rating: Rating) => {
    setRatings(prev => ({ ...prev, [id]: rating }));
  };

  const handleCommentChange = (id: number, comment: string) => {
    setComments(prev => ({ ...prev, [id]: comment }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(ratings).length < COMPETENCIES.length) return;
    
    setIsSubmitting(true);
    
    // Simple calculation: scale 1-4 to 25-100
    const scale = (r: number) => r * 25;
    
    const newEvaluation: Omit<CompetencyEvaluation, 'id'> = {
      traineeId: trainee.id,
      date: evalDate,
      evaluator: evaluator,
      score: (Object.values(ratings).map(Number).reduce((a, b) => a + b, 0) / COMPETENCIES.length),
      result: 'satisfactory', // Simplified
      category: 'Monthly Assessment Report',
      details: overallComment,
      // Radar Chart Metrics
      atm: scale(((ratings[2] || 0) + (ratings[3] || 0)) / 2),
      comm: scale(((ratings[4] || 0) + (ratings[5] || 0)) / 2),
      tech: scale(((ratings[1] || 0) + (ratings[6] || 0)) / 2),
      nav: scale(ratings[7] || 0),
      ops: scale(((ratings[8] || 0) + (ratings[9] || 0)) / 2),
      // Progress Bar Metrics
      situationalAwareness: scale(ratings[1] || 0),
      communication: scale(ratings[4] || 0),
      proceduralAccuracy: scale(ratings[3] || 0),
      stressManagement: scale(ratings[6] || 0),
      cooperation: scale(ratings[5] || 0)
    };

    setTimeout(() => {
      onAddEvaluation?.(newEvaluation);
      setIsSubmitting(false);
      alert('평가가 성공적으로 저장되어 대시보드에 반영되었습니다.');
    }, 800);
  };

  const ratingLabels = [
    { value: 1, label: '부족', en: 'Insufficient', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', activeBg: 'bg-red-500', activeText: 'text-white' },
    { value: 2, label: '부분', en: 'Partial', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', activeBg: 'bg-amber-500', activeText: 'text-white' },
    { value: 3, label: '만족', en: 'Satisfactory', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-500', activeText: 'text-white' },
    { value: 4, label: '능통', en: 'Proficient', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', activeBg: 'bg-emerald-500', activeText: 'text-white' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">월간 역량 평가</h2>
            <p className="text-slate-500 mt-2">운영 능력 및 전문적 행동에 대한 종합적인 검토입니다.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center min-w-[180px]">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">평가 기간</p>
             <p className="text-lg font-bold text-slate-800">2026년 5월</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">훈련생 성명</label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-semibold text-slate-800 flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400" />
              {trainee.name}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">평가자 / 교관</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                value={evaluator}
                onChange={(e) => setEvaluator(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-11 pr-4 py-3 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">평가 일자</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date"
                value={evalDate}
                onChange={(e) => setEvalDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-11 pr-4 py-3 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Competencies Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            10대 핵심 역량
          </h3>
          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-wider">
            {ratingLabels.map(rating => (
               <div key={rating.value} className="flex items-center gap-2">
                 <div className={cn("w-2 h-2 rounded-full", rating.activeBg)} />
                 <span className="text-slate-400">{rating.label}</span>
               </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {COMPETENCIES.map((comp) => (
            <div key={comp.id} className="p-8 hover:bg-slate-50/30 transition-colors">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">
                    {comp.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{comp.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{comp.enTitle}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{comp.description}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ratingLabels.map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => handleRatingChange(comp.id, rating.value as Rating)}
                        className={cn(
                          "py-3 rounded-lg border font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          ratings[comp.id] === rating.value
                            ? `${rating.activeBg} ${rating.activeText} border-transparent shadow-md transform scale-105`
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        {rating.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-3 top-3">
                       <MessageSquare className="w-4 h-4 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <textarea 
                      placeholder={`${comp.title} 관련 의견 입력...`}
                      value={comments[comp.id] || ''}
                      onChange={(e) => handleCommentChange(comp.id, e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-300 focus:bg-white transition-all min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Opinion Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          종합 교관 의견
        </h3>
        <textarea 
          placeholder="이번 달의 종합적인 피드백을 입력하세요..."
          value={overallComment}
          onChange={(e) => setOverallComment(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all min-h-[200px]"
        />
        
        {/* Validation Warning */}
        {Object.keys(ratings).length < COMPETENCIES.length && (
          <div className="mt-6 flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">제출하기 전에 10가지 역량 등급을 모두 완료해 주세요.</p>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-10 pb-4">
          <button className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
            임시 저장
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(ratings).length < COMPETENCIES.length}
            className={cn(
              "px-10 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95",
              isSubmitting ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? "평가 저장 중..." : "최종 평가 저장"}
          </button>
        </div>
      </div>
    </div>
  );
};
