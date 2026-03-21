import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject } from '@/types';

type GradeState = Record<string, string>; // [subjectCode]: grade
type SelectionState = Record<string, string>; // [placeholderCode]: selectedSubjectCode

interface GpaStore {
  regulation: string;
  department: string;
  // [reg][dept][sem] = GradeState
  grades: Record<string, Record<string, Record<number, GradeState>>>;
  // [reg][dept][sem] = SelectionState
  selections: Record<string, Record<string, Record<number, SelectionState>>>;
  // [reg][dept][sem] = Subject[]
  extraSubjects: Record<string, Record<string, Record<number, Subject[]>>>;
  setRegulation: (reg: string) => void;
  setDepartment: (dept: string) => void;
  setGrade: (sem: number, subjectCode: string, grade: string) => void;
  getGrade: (sem: number, subjectCode: string) => string;
  setSelection: (sem: number, placeholderCode: string, selectedSubjectCode: string) => void;
  getSelection: (sem: number, placeholderCode: string) => string | undefined;
  addExtraSubject: (sem: number, subject: Subject) => void;
  removeExtraSubject: (sem: number, subjectCode: string) => void;
  resetSemester: (sem: number) => void;
  resetAll: () => void;
}

export const useGpaStore = create<GpaStore>()(
  persist(
    (set, get) => ({
      regulation: 'R2021',
      department: 'CSE',
      grades: {},
      selections: {},
      extraSubjects: {},
      setRegulation: (reg) => set({ regulation: reg }),
      setDepartment: (dept) => set({ department: dept }),
      
      setGrade: (sem, subjectCode, grade) => set((state) => {
        const { regulation, department } = state;
        const currentGrades = structuredClone(state.grades);
        
        if (!currentGrades[regulation]) currentGrades[regulation] = {};
        if (!currentGrades[regulation][department]) currentGrades[regulation][department] = {};
        if (!currentGrades[regulation][department][sem]) currentGrades[regulation][department][sem] = {};
        
        currentGrades[regulation][department][sem][subjectCode] = grade;
        
        return { grades: currentGrades };
      }),
      
      getGrade: (sem, subjectCode) => {
        const state = get();
        return state.grades[state.regulation]?.[state.department]?.[sem]?.[subjectCode] || '';
      },

      setSelection: (sem, placeholderCode, selectedSubjectCode) => set((state) => {
        const { regulation, department } = state;
        const currentSelections = structuredClone(state.selections);
        
        if (!currentSelections[regulation]) currentSelections[regulation] = {};
        if (!currentSelections[regulation][department]) currentSelections[regulation][department] = {};
        if (!currentSelections[regulation][department][sem]) currentSelections[regulation][department][sem] = {};
        
        currentSelections[regulation][department][sem][placeholderCode] = selectedSubjectCode;
        
        return { selections: currentSelections };
      }),

      getSelection: (sem, placeholderCode) => {
        const state = get();
        return state.selections[state.regulation]?.[state.department]?.[sem]?.[placeholderCode];
      },

      addExtraSubject: (sem: number, subject: Subject) => set((state) => {
        const { regulation, department } = state;
        const currentExtra = structuredClone(state.extraSubjects);
        
        if (!currentExtra[regulation]) currentExtra[regulation] = {};
        if (!currentExtra[regulation][department]) currentExtra[regulation][department] = {};
        if (!currentExtra[regulation][department][sem]) currentExtra[regulation][department][sem] = [];
        
        // ensure no duplicates by code
        if (!currentExtra[regulation][department][sem].some((s: Subject) => s.code === subject.code)) {
           currentExtra[regulation][department][sem].push(subject);
        }
        
        return { extraSubjects: currentExtra };
      }),

      removeExtraSubject: (sem: number, subjectCode: string) => set((state) => {
        const { regulation, department } = state;
        const currentExtra = structuredClone(state.extraSubjects);
        
        if (currentExtra[regulation]?.[department]?.[sem]) {
           currentExtra[regulation][department][sem] = currentExtra[regulation][department][sem].filter((s: Subject) => s.code !== subjectCode);
        }
        
        // Also clean up Grade map so it doesn't linger forever
        const currentGrades = structuredClone(state.grades);
        if (currentGrades[regulation]?.[department]?.[sem]?.[subjectCode]) {
           delete currentGrades[regulation][department][sem][subjectCode];
        }
                return { extraSubjects: currentExtra, grades: currentGrades };
      }),
      
      resetSemester: (sem) => set((state) => {
        const { regulation, department } = state;
        const currentGrades = structuredClone(state.grades);
        const currentSelections = structuredClone(state.selections);
        const currentExtra = structuredClone(state.extraSubjects);
        
        if (currentGrades[regulation]?.[department]?.[sem]) {
          currentGrades[regulation][department][sem] = {};
        }
        if (currentSelections[regulation]?.[department]?.[sem]) {
          currentSelections[regulation][department][sem] = {};
        }
        if (currentExtra[regulation]?.[department]?.[sem]) {
          currentExtra[regulation][department][sem] = [];
        }
        
        return { grades: currentGrades, selections: currentSelections, extraSubjects: currentExtra };
      }),
      
      resetAll: () => set((state) => {
        const { regulation, department } = state;
        const currentGrades = structuredClone(state.grades);
        const currentSelections = structuredClone(state.selections);
        const currentExtra = structuredClone(state.extraSubjects);
        
        if (currentGrades[regulation]?.[department]) {
          currentGrades[regulation][department] = {};
        }
        if (currentSelections[regulation]?.[department]) {
          currentSelections[regulation][department] = {};
        }
        if (currentExtra[regulation]?.[department]) {
          currentExtra[regulation][department] = {};
        }
        
        return { grades: currentGrades, selections: currentSelections, extraSubjects: currentExtra };
      })
    }),
    {
      name: 'gpafy-next-storage',
      // Optional: version tracking or migrations can go here if needed
    }
  )
);
