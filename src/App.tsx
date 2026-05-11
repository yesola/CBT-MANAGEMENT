import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './views/Dashboard';
import { TraineeList } from './views/TraineeList';
import { TrainingLog } from './views/TrainingLog';
import { CompetencyEval } from './views/CompetencyEval';
import { Archive } from './views/Archive';
import { MOCK_TRAINEES, MOCK_HISTORY, MOCK_EVALUATIONS } from './constants';
import { View, Trainee, TrainingLogEntry, CompetencyEvaluation } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [trainees, setTrainees] = useState<Trainee[]>(MOCK_TRAINEES);
  const [history, setHistory] = useState<TrainingLogEntry[]>(MOCK_HISTORY);
  const [evaluations, setEvaluations] = useState<CompetencyEvaluation[]>(MOCK_EVALUATIONS);
  const [currentView, setCurrentView] = useState<View>('trainees');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(trainees[0].id);
  const [viewingEvaluation, setViewingEvaluation] = useState<CompetencyEvaluation | null>(null);
  const [evaluationDraft, setEvaluationDraft] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);

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
    const newTrainee: Trainee = {
      ...newTraineeData,
      id: (trainees.length + 1).toString(),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=150`,
      progress: 0,
      status: 'active',
      lastSession: 'Never',
      unit: '', // Default values since the form doesn't have these yet
      profileRemarks: '신규 등록',
      joinedDate: newTraineeData.joinedDate
    };
    setTrainees([...trainees, newTrainee]);
  };

  const handleAddLog = (newLog: Omit<TrainingLogEntry, 'id'>) => {
    const log: TrainingLogEntry = {
      ...newLog,
      id: `h${history.length + 1}`
    };
    setHistory([log, ...history]);
  };

  const handleUpdateLog = (id: string, updatedLog: Omit<TrainingLogEntry, 'id'>) => {
    setHistory(history.map(log => log.id === id ? { ...updatedLog, id } : log));
  };

  const handleDeleteLog = (id: string) => {
    setHistory(history.filter(log => log.id !== id));
  };

  const handleAddEvaluation = (newEval: Omit<CompetencyEvaluation, 'id'>) => {
    const evaluation: CompetencyEvaluation = {
      ...newEval,
      id: `e${evaluations.length + 1}`
    };
    setEvaluations([evaluation, ...evaluations]);
    setCurrentView('dashboard');
  };

  const handleUpdateEvaluation = (id: string, updatedItem: Omit<CompetencyEvaluation, 'id'>) => {
    setEvaluations(prev => prev.map(ev => ev.id === id ? { ...ev, ...updatedItem } : ev));
    setViewingEvaluation(null);
    setCurrentView('dashboard');
  };

  const handleUpdateTrainee = (id: string, updatedInfo: Partial<Trainee>) => {
    setTrainees(trainees.map(t => t.id === id ? { ...t, ...updatedInfo } : t));
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
        return <Archive />;
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
