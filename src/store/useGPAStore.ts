import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number; // For new component
  gradeLabel: string;  // For old component compatibility
  gradeValue: number;  // For old component compatibility
  semesterId: string;
  category?: string;
  isProjected?: boolean;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
  gpa: number;
  totalCredits: number;
  isActive: boolean;
}

export interface GPAState {
  // State
  semesters: Semester[];
  activeSemesterId: string | null;
  targetGPA: number | null; // Changed to allow null
  gradingScale: '4.0' | '5.0' | '10.0';
  
  // Computed
  cumulativeGPA: number;
  totalCredits: number;
  
  // Actions
  addSemester: (name: string) => void; // Updated signature to match App.tsx
  removeSemester: (id: string) => void;
  setActiveSemester: (id: string) => void;
  
  // Mixed support for addSubject
  addSubject: (subject: Omit<Subject, 'id' | 'gradePoints' | 'gradeLabel' | 'gradeValue'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (semesterId: string, subjectId: string) => void; // Updated signature to match SubjectRow.tsx
  
  setTargetGPA: (target: number | null) => void;
  setGradingScale: (scale: '4.0' | '5.0' | '10.0') => void;
  
  // Expected by App.tsx and other components
  calculateGPA: (semesterId: string) => number;
  calculateCGPA: () => number;
  
  // Internal helper (kept for consistency with prompt)
  _calculateGPAFromSubjects: (subjects: Subject[]) => number;
  calculateCumulativeGPA: () => number;
  
  // Utility
  reset: () => void;
}

// Grade to points conversion
const gradeToPoints = (grade: string, scale: '4.0' | '5.0' | '10.0'): number => {
  const gradeMap: Record<string, Record<string, number>> = {
    '10.0': {
      'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0,
    },
    '4.0': {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0,
    },
    '5.0': {
      'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'F': 0,
    },
  };
  
  return gradeMap[scale][grade.toUpperCase()] || 0;
};

// Initial state
const initialState = {
  semesters: [
    { id: '1', name: 'Semester 1', subjects: [], gpa: 0, totalCredits: 0, isActive: true }
  ],
  activeSemesterId: '1',
  targetGPA: 8.0,
  gradingScale: '10.0' as const,
  cumulativeGPA: 0,
  totalCredits: 0,
};

// Create store
export const useGPAStore = create<GPAState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addSemester: (name) => {
        const id = `semester-${Date.now()}`;
        const newSemester: Semester = {
          id,
          name,
          subjects: [],
          gpa: 0,
          totalCredits: 0,
          isActive: false,
        };
        
        set((state) => ({
          semesters: [...state.semesters, newSemester],
          activeSemesterId: id,
        }));
      },

      removeSemester: (id) => {
        set((state) => ({
          semesters: state.semesters.filter((s) => s.id !== id),
          activeSemesterId: state.activeSemesterId === id 
            ? state.semesters[0]?.id || null 
            : state.activeSemesterId,
        }));
      },

      setActiveSemester: (id) => {
        set({ activeSemesterId: id });
      },

      addSubject: (subject) => {
        const { activeSemesterId, gradingScale } = get();
        if (!activeSemesterId) return;

        const id = `subject-${Date.now()}`;
        const gradePoints = gradeToPoints(subject.grade, gradingScale);
        
        const newSubject: Subject = {
          ...subject,
          id,
          gradePoints,
          gradeLabel: subject.grade,
          gradeValue: gradePoints,
        };

        set((state) => {
          const semesters = state.semesters.map((semester) => {
            if (semester.id === activeSemesterId) {
              const subjects = [...semester.subjects, newSubject];
              const gpa = get()._calculateGPAFromSubjects(subjects);
              const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
              
              return { ...semester, subjects, gpa, totalCredits };
            }
            return semester;
          });

          return {
            semesters,
            cumulativeGPA: get().calculateCumulativeGPA(),
          };
        });
      },

      updateSubject: (id, updates) => {
        const { gradingScale } = get();
        
        set((state) => {
          const semesters = state.semesters.map((semester) => {
            const subjects = semester.subjects.map((subject) => {
              if (subject.id === id) {
                const updatedSubject = { ...subject, ...updates };
                if (updates.grade) {
                  updatedSubject.gradePoints = gradeToPoints(updates.grade, gradingScale);
                  updatedSubject.gradeLabel = updates.grade;
                  updatedSubject.gradeValue = updatedSubject.gradePoints;
                }
                return updatedSubject;
              }
              return subject;
            });

            const gpa = get()._calculateGPAFromSubjects(subjects);
            const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
            
            return { ...semester, subjects, gpa, totalCredits };
          });

          return {
            semesters,
            cumulativeGPA: get().calculateCumulativeGPA(),
          };
        });
      },

      removeSubject: (semesterId, subjectId) => {
        set((state) => {
          const semesters = state.semesters.map((semester) => {
            if (semester.id === semesterId) {
              const subjects = semester.subjects.filter((s) => s.id !== subjectId);
              const gpa = get()._calculateGPAFromSubjects(subjects);
              const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
              return { ...semester, subjects, gpa, totalCredits };
            }
            return semester;
          });

          return {
            semesters,
            cumulativeGPA: get().calculateCumulativeGPA(),
          };
        });
      },

      setTargetGPA: (target) => {
        set({ targetGPA: target });
      },

      setGradingScale: (scale) => {
        set({ gradingScale: scale });
      },

      _calculateGPAFromSubjects: (subjects) => {
        if (subjects.length === 0) return 0;

        const totalPoints = subjects.reduce(
          (sum, subject) => sum + subject.gradePoints * subject.credits,
          0
        );
        const totalCredits = subjects.reduce(
          (sum, subject) => sum + subject.credits,
          0
        );

        return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
      },

      calculateGPA: (semesterId) => {
        const semester = get().semesters.find(s => s.id === semesterId);
        if (!semester || semester.subjects.length === 0) return 0;
        return semester.gpa;
      },

      calculateCGPA: () => {
        return get().calculateCumulativeGPA();
      },

      calculateCumulativeGPA: () => {
        const { semesters } = get();
        
        let totalPoints = 0;
        let totalCredits = 0;

        semesters.forEach((semester) => {
          semester.subjects.forEach((subject) => {
            totalPoints += subject.gradePoints * subject.credits;
            totalCredits += subject.credits;
          });
        });

        return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'gpa-calculator-storage',
      version: 1,
    }
  )
);
