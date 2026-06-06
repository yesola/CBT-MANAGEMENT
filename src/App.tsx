import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './views/Dashboard';
import { TraineeList } from './views/TraineeList';
import { TrainingLog } from './views/TrainingLog';
import { CompetencyEval } from './views/CompetencyEval';
import { Archive } from './views/Archive';
import { MOCK_TRAINEES, MOCK_HISTORY, MOCK_EVALUATIONS, PROFILE_AVATARS, MOCK_ARCHIVE_DOCS } from './constants';
import { View, Trainee, TrainingLogEntry, CompetencyEvaluation, ArchiveDocument } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { loadData, saveData } from './lib/storage';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Users, 
  BookOpen, 
  BarChart3, 
  FolderOpen, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  // ── 클라우드(Supabase)에서 불러오기 전까지는 빈 상태로 시작 ──
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [history, setHistory] = useState<TrainingLogEntry[]>([]);
  const [evaluations, setEvaluations] = useState<CompetencyEvaluation[]>([]);
  const [archiveDocs, setArchiveDocs] = useState<ArchiveDocument[]>([]);
  const [loaded, setLoaded] = useState(false); // 클라우드 로딩 완료 여부

  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as View) || 'trainees';
  });

  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(() => {
    const saved = localStorage.getItem('selectedTraineeId');
    return saved || '';
  });
  const [viewingEvaluation, setViewingEvaluation] = useState<CompetencyEvaluation | null>(null);
  const [evaluationDraft, setEvaluationDraft] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('evaluationDraft');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading evaluation draft', e);
      return null;
    }
  });
  const mainRef = useRef<HTMLElement>(null);

  // 앱이 처음 켜질 때 Supabase에서 데이터 불러오기
  useEffect(() => {
    (async () => {
      const t = await loadData<Trainee[]>('trainees', MOCK_TRAINEES);
      const h = await loadData<TrainingLogEntry[]>('history', MOCK_HISTORY);
      const ev = await loadData<CompetencyEvaluation[]>('evaluations', MOCK_EVALUATIONS);
      const ar = await loadData<ArchiveDocument[]>('archiveDocs', MOCK_ARCHIVE_DOCS);
      setTrainees(t);
      setHistory(h);
      setEvaluations(ev);
      setArchiveDocs(ar);
      // 선택된 훈련생이 목록에 없으면 첫 번째로 맞춤
      setSelectedTraineeId(prev =>
        t.some(x => x.id === prev) ? prev : (t.length > 0 ? t[0].id : '')
      );
      setLoaded(true);
    })();
  }, []);

  // ── 데이터가 바뀔 때마다 Supabase에 저장 (로딩 완료 후에만) ──
  useEffect(() => { if (loaded) saveData('trainees', trainees); }, [trainees, loaded]);
  useEffect(() => { if (loaded) saveData('history', history); }, [history, loaded]);
  useEffect(() => { if (loaded) saveData('evaluations', evaluations); }, [evaluations, loaded]);
  useEffect(() => { if (loaded) saveData('archiveDocs', archiveDocs); }, [archiveDocs, loaded]);

  useEffect(() => {
    if (evaluationDraft) {
      localStorage.setItem('evaluationDraft', JSON.stringify(evaluationDraft));
    } else {
      localStorage.removeItem('evaluationDraft');
    }
  }, [evaluationDraft]);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('selectedTraineeId', selectedTraineeId);
  }, [selectedTraineeId]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [currentView]);

  const selectedTrainee = trainees.find(t => t.id === selectedTraineeId) || trainees[0];

  const handleSelectTrainee = (id: string) => {
    setSelectedTraineeId(id);
    setViewingEvaluation(null);
    setCurrentView('dashboard');
  };

  const handleAddTrainee = (newTraineeData: Omit<Trainee, 'id' | 'avatar' | 'progress' | 'status' | 'lastSession'>) => {
    // Pick a random avatar from the list
    const allAvatars = [...PROFILE_AVATARS.male, ...PROFILE_AVATARS.female];
    const randomAvatar = allAvatars[Math.floor(Math.random() * allAvatars.length)];

    const newTrainee: Trainee = {
      ...newTraineeData,
      id: `t-${Date.now()}`,
      avatar: randomAvatar,
      progress: 0,
      status: 'active',
      lastSession: 'Never',
      unit: '',
      profileRemarks: '신규 등록'
    };
    setTrainees(prev => [...prev, newTrainee]);
  };

  const handleAddLog = (newLog: Omit<TrainingLogEntry, 'id'>) => {
    const log: TrainingLogEntry = {
      ...newLog,
      id: `h-${Date.now()}`
    };
    setHistory(prev => [log, ...prev]);
  };

  const handleUpdateLog = (id: string, updatedLog: Omit<TrainingLogEntry, 'id'>) => {
    setHistory(prev => prev.map(log => log.id === id ? { ...updatedLog, id } : log));
  };

  const handleDeleteLog = (id: string) => {
    setHistory(prev => prev.filter(log => log.id !== id));
  };

  const handleAddEvaluation = (newEval: Omit<CompetencyEvaluation, 'id'>) => {
    const evaluation: CompetencyEvaluation = {
      ...newEval,
      id: `e-${Date.now()}`
    };
    setEvaluations(prev => [evaluation, ...prev]);
    setCurrentView('dashboard');
  };

  const handleUpdateEvaluation = (id: string, updatedItem: Omit<CompetencyEvaluation, 'id'>) => {
    setEvaluations(prev => prev.map(ev => ev.id === id ? { ...ev, ...updatedItem } : ev));
    setViewingEvaluation(null);
    setCurrentView('dashboard');
  };

  const handleUpdateTrainee = (id: string, updatedInfo: Partial<Trainee>) => {
    setTrainees(prev => prev.map(t => t.id === id ? { ...t, ...updatedInfo } : t));
  };

  const handleDeleteTrainee = (id: string) => {
    setTrainees(prev => {
      const remaining = prev.filter(t => t.id !== id);
      if (selectedTraineeId === id) {
        if (remaining.length > 0) {
          setSelectedTraineeId(remaining[0].id);
        } else {
          setSelectedTraineeId('');
        }
      }
      return remaining;
    });
    // Cascade-delete related training logs and evaluations
    setHistory(prev => prev.filter(h => h.traineeId !== id));
    setEvaluations(prev => prev.filter(e => e.traineeId !== id));
  };

  const handleAddArchiveDoc = (newDoc: Omit<ArchiveDocument, 'id'>) => {
    const doc: ArchiveDocument = {
      ...newDoc,
      id: `d-${Date.now()}`
    };
    setArchiveDocs(prev => [doc, ...prev]);
  };

  const handleDeleteArchiveDoc = (id: string) => {
    setArchiveDocs(prev => prev.filter(doc => doc.id !== id));
  };

  // ── 클라우드에서 불러오는 중에는 로딩 화면 표시 ──
  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0e5c8e] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            trainee={selectedTrainee} 
            trainees={trainees} 
            history={history}
            evaluations={evaluations.filter(e => e.traineeId === selectedTrainee.id)}
            onSelectTrainee={handleSelectTrainee} 
            onAddLog={handleAddLog}
            onUpdateLog={handleUpdateLog}
            onDeleteLog={handleDeleteLog}
            onUpdateTrainee={handleUpdateTrainee}
            onViewEvaluation={(ev) => {
              setViewingEvaluation(ev);
              setCurrentView('evaluation');
            }}
          />
        );
      case 'logs':
        return (
          <TrainingLog 
            trainee={selectedTrainee} 
            history={history} 
            onAddLog={handleAddLog} 
            onUpdateLog={handleUpdateLog}
            onDeleteLog={handleDeleteLog}
          />
        );
      case 'trainees':
        return <TraineeList trainees={trainees} onSelectTrainee={handleSelectTrainee} onAddTrainee={handleAddTrainee} onDeleteTrainee={handleDeleteTrainee} />;
      case 'evaluation':
        return (
          <CompetencyEval 
            trainee={selectedTrainee} 
            onAddEvaluation={(ev) => {
              handleAddEvaluation(ev);
              setEvaluationDraft(null);
            }} 
            onUpdateEvaluation={handleUpdateEvaluation}
            viewingEvaluation={viewingEvaluation}
            onResetViewing={() => {
              setViewingEvaluation(null);
              setCurrentView('dashboard');
            }}
            draft={evaluationDraft}
            onDraftChange={setEvaluationDraft}
          />
        );
      case 'archive':
        return (
          <Archive 
            docs={archiveDocs} 
            onAddDoc={handleAddArchiveDoc} 
            onDeleteDoc={handleDeleteArchiveDoc} 
          />
        );
      case 'settings':
        return (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Database className="w-8 h-8 text-[#0e5c8e]" />
                설정 및 데이터 백업 관리자
              </h2>
              <p className="text-slate-500 mt-1">시스템 데이터를 보관하고 안전하게 관리하거나 공장 기본값 상태로 초기화할 수 있습니다.</p>
            </div>

            {/* Current Storage Statistics */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                저장소 통계
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 text-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 block">등록된 훈련생 수</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">{trainees.length}명</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 text-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 block">누적 OJT 실습 로그</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">{history.length}개</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-2 text-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 block">역량 평가 완료 서류</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">{evaluations.length}개</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 text-lg">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 block">자료실 업로드 문서</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">{archiveDocs.length}개</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Export Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[260px]">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Download className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800">데이터 내보내기 (백업)</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    현재 등록된 훈련생 명부, 누적 실습 내용, 작성된 월간 역량 평가와 자료실에 등재된 첨부 자료를 `.json` 백업 파일로 추출하여 안전하게 저장합니다.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const dataObj = {
                      trainees,
                      history,
                      evaluations,
                      archiveDocs,
                      timestamp: new Date().toISOString()
                    };
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `ATC_Training_Backup_${new Date().toISOString().split('T')[0]}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="w-full mt-4 py-3 bg-[#0e5c8e] hover:bg-[#0a4a75] text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  백업 다운로드
                </button>
              </div>

              {/* Import Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[260px]">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800">데이터 가져오기 (복원)</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    과거에 내려받은 백업 파일(`.json`)을 시스템 상으로 불러와 현재 데이터에 그대로 덮어씁니다. 가져오는 즉시 데이터가 복구 및 반영됩니다.
                  </p>
                </div>
                <div className="relative mt-4">
                  <input
                    type="file"
                    accept=".json"
                    id="import-backup-file"
                    className="hidden"
                    onChange={(e) => {
                      const fileReader = new FileReader();
                      if (e.target.files && e.target.files[0]) {
                        fileReader.readAsText(e.target.files[0], "UTF-8");
                        fileReader.onload = (event) => {
                          try {
                            const parsed = JSON.parse(event.target?.result as string);
                            if (parsed.trainees && parsed.history && parsed.evaluations) {
                              setTrainees(parsed.trainees);
                              setHistory(parsed.history);
                              setEvaluations(parsed.evaluations);
                              if (parsed.archiveDocs) {
                                setArchiveDocs(parsed.archiveDocs);
                              }
                              if (parsed.trainees.length > 0) {
                                setSelectedTraineeId(parsed.trainees[0].id);
                              }
                              alert('전체 데이터 백업 복원이 완료되었습니다!');
                            } else {
                              alert('올바르지 않은 백업 양식입니다.');
                            }
                          } catch (err) {
                            alert('가져온 JSON 파일을 파싱하는 데 실패했습니다.');
                          }
                        };
                      }
                    }}
                  />
                  <label
                    htmlFor="import-backup-file"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 text-center block cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    백업 파일 들여오기
                  </label>
                </div>
              </div>

              {/* Reset Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[260px]">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800">모든 정보 초기화</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    저장된 모든 훈련 일지 내역과 관제사 등록 데이터 및 교육 자료를 통째로 비우고 순수 기본 데모 빌드로 회귀합니다.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const confirmReset = window.confirm('⚠️ 주의: 정말로 모든 관제 세션 결과 및 훈련생 로그를 완전 삭제하시겠습니까? 지워진 후에는 이전으로 복구할 수 없습니다.');
                    if (confirmReset) {
                      setTrainees(MOCK_TRAINEES);
                      setHistory(MOCK_HISTORY);
                      setEvaluations(MOCK_EVALUATIONS);
                      setArchiveDocs(MOCK_ARCHIVE_DOCS);
                      setEvaluationDraft(null);
                      if (MOCK_TRAINEES.length > 0) {
                        setSelectedTraineeId(MOCK_TRAINEES[0].id);
                      }
                      alert('전체 저장 공간이 성공적으로 비워지고 기본 데이터 데모셋으로 롤백되었습니다.');
                    }
                  }}
                  className="w-full mt-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  기본값 상태 복구
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        setView={(v) => {
          setViewingEvaluation(null);
          setCurrentView(v);
        }} 
        activeTrainee={selectedTrainee} 
      />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main ref={mainRef} className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
