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

export default function App() {
  const [trainees, setTrainees] = useState<Trainee[]>(() => {
    try {
      const saved = localStorage.getItem('trainees');
      return saved ? JSON.parse(saved) : MOCK_TRAINEES;
    } catch (e) {
      console.error('Error loading trainees', e);
      return MOCK_TRAINEES;
    }
  });

  const [history, setHistory] = useState<TrainingLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : MOCK_HISTORY;
    } catch (e) {
      console.error('Error loading history', e);
      return MOCK_HISTORY;
    }
  });

  const [evaluations, setEvaluations] = useState<CompetencyEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem('evaluations');
      return saved ? JSON.parse(saved) : MOCK_EVALUATIONS;
    } catch (e) {
      console.error('Error loading evaluations', e);
      return MOCK_EVALUATIONS;
    }
  });

  const [archiveDocs, setArchiveDocs] = useState<ArchiveDocument[]>(() => {
    try {
      const saved = localStorage.getItem('archiveDocs');
      return saved ? JSON.parse(saved) : MOCK_ARCHIVE_DOCS;
    } catch (e) {
      console.error('Error loading archive docs', e);
      return MOCK_ARCHIVE_DOCS;
    }
  });

  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as View) || 'trainees';
  });

  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(() => {
    const saved = localStorage.getItem('selectedTraineeId');
    if (saved) return saved;
    
    // Fallback to first available trainee
    const savedTrainees = localStorage.getItem('trainees');
    if (savedTrainees) {
      try {
        const parsed = JSON.parse(savedTrainees);
        if (parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return MOCK_TRAINEES.length > 0 ? MOCK_TRAINEES[0].id : '';
  });
  const [viewingEvaluation, setViewingEvaluation] = useState<CompetencyEvaluation | null>(null);
  const [evaluationDraft, setEvaluationDraft] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    localStorage.setItem('trainees', JSON.stringify(trainees));
  }, [trainees]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('archiveDocs', JSON.stringify(archiveDocs));
  }, [archiveDocs]);

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
        return <TraineeList trainees={trainees} onSelectTrainee={handleSelectTrainee} onAddTrainee={handleAddTrainee} />;
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <span className="text-2xl">⚙️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">설정</h2>
            <p className="text-slate-500 max-w-xs">시스템 환경설정 및 사용자 권한을 구성합니다.</p>
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
