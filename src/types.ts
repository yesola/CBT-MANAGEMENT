export type View = 'dashboard' | 'trainees' | 'logs' | 'evaluation' | 'archive' | 'settings';

export interface Trainee {
  id: string;
  name: string;
  unit: string;
  profileRemarks: string;
  progress: number;
  status: 'active' | 'suspended' | 'completed';
  joinedDate: string;
  lastSession: string;
  avatar: string;
  birthDate?: string;
}

export interface TrainingLogEntry {
  id: string;
  traineeId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  station: string; // 근무석
  instructor: string;
  topic: string;
  category: 'OJT' | 'Requal' | '현장 업무 훈련 (OJT)';
  remarks?: string;
  comments: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface CompetencyEvaluation {
  id: string;
  traineeId: string;
  date: string;
  evaluator: string;
  score: number;
  result: 'pass' | 'fail' | 'marginal' | 'satisfactory' | 'unsatisfactory';
  category: string;
  details: string;
  // Metrics for radar chart (Unit Skill Breakdown)
  atm: number;
  comm: number;
  tech: number;
  nav: number;
  ops: number;
  // Metrics for progress bars (Competency Profile)
  situationalAwareness: number;
  communication: number;
  proceduralAccuracy: number;
  stressManagement: number;
  cooperation: number;
}

export interface Stat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}
