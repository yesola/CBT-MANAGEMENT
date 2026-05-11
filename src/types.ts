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
  // Metrics for radar chart (6 core competencies)
  situationalAwareness: number;
  trafficManagement: number;
  separationConflict: number;
  communication: number;
  cooperation: number;
  selfManagement: number;
  // Metrics for progress bars (if needed, keeping them or reusing)
  proceduralAccuracy: number;
  stressManagement: number;
  rawRatings?: Record<number, number>;
}

export interface Stat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ArchiveDocument {
  id: string;
  title: string;
  uploadDate: string;
  instructor: string;
  sector: string;
  thumbnail: string;
  type: string;
}
