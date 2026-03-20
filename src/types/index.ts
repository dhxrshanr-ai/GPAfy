export type GradingScale = '4.0' | '5.0' | '10.0';

export interface Grade {
  label: string;
  points: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  gradeValue: number; // The points on the current scale
  gradeLabel: string;
  isProjected?: boolean;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
  gpa: number;
}

export interface GPAState {
  semesters: Semester[];
  gradingScale: GradingScale;
  targetGPA: number | null;
  
  // Actions
  addSemester: (name: string) => void;
  removeSemester: (id: string) => void;
  addSubject: (semesterId: string, subject: Omit<Subject, 'id'>) => void;
  updateSubject: (semesterId: string, subjectId: string, updates: Partial<Subject>) => void;
  removeSubject: (semesterId: string, subjectId: string) => void;
  setGradingScale: (scale: GradingScale) => void;
  setTargetGPA: (target: number | null) => void;
  
  // Calculations
  calculateGPA: (semesterId: string) => number;
  calculateCGPA: () => number;
}
