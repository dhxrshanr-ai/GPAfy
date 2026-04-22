import { create } from 'zustand';
import { Subject } from '@/types';
import { 
  MASTER_R2021_SUBJECTS, 
  MASTER_R2025_SUBJECTS, 
  ALL_OPEN_ELECTIVES, 
  ALL_PROFESSIONAL_ELECTIVES, 
  ALL_MANDATORY_COURSES 
} from '@/data';

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
  // [reg][dept][sem] = count
  subjectCounts: Record<string, Record<string, Record<number, number>>>;
  // [reg][dept][sem] = { sgpa: string, credits: string }
  manualSemData: Record<string, Record<string, Record<number, { sgpa: string, credits: string }>>>;
  cgpaSemesterCount: Record<string, Record<string, number>>;
  theme: 'dark' | 'light';
  
  toggleTheme: () => void;
  setRegulation: (reg: string) => void;
  setDepartment: (dept: string) => void;
  setGrade: (sem: number, subjectCode: string, grade: string) => void;
  getGrade: (sem: number, subjectCode: string) => string;
  setSelection: (sem: number, placeholderCode: string, selectedSubjectCode: string) => void;
  getSelection: (sem: number, placeholderCode: string) => string | undefined;
  addExtraSubject: (sem: number, subject: Subject) => void;
  removeExtraSubject: (sem: number, subjectCode: string) => void;
  setSubjectCount: (sem: number, count: number) => void;
  setManualSemData: (sem: number, data: { sgpa: string, credits: string }) => void;
  setCgpaSemesterCount: (count: number) => void;
  getMasterSubjects: (reg: string) => Subject[];
  getElectivePools: (reg: string) => Subject[];
  resetSemester: (sem: number) => void;
  resetAll: () => void;
}

export const useGpaStore = create<GpaStore>()((set, get) => ({
  regulation: 'R2021',
  department: 'CSE',
  grades: {},
  selections: {},
  extraSubjects: {},
  subjectCounts: {},
  manualSemData: {},
  cgpaSemesterCount: {},
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

  setSubjectCount: (sem, count) => set((state) => {
    const { regulation, department } = state;
    const currentCounts = structuredClone(state.subjectCounts);
    
    if (!currentCounts[regulation]) currentCounts[regulation] = {};
    if (!currentCounts[regulation][department]) currentCounts[regulation][department] = {};
    
    currentCounts[regulation][department][sem] = count;
    return { subjectCounts: currentCounts };
  }),

  setManualSemData: (sem, data) => set((state) => {
    const { regulation, department } = state;
    const currentManual = structuredClone(state.manualSemData);
    if (!currentManual[regulation]) currentManual[regulation] = {};
    if (!currentManual[regulation][department]) currentManual[regulation][department] = {};
    currentManual[regulation][department][sem] = data;
    return { manualSemData: currentManual };
  }),

  setCgpaSemesterCount: (count) => set((state) => {
    const { regulation, department } = state;
    const currentCounts = structuredClone(state.cgpaSemesterCount);
    if (!currentCounts[regulation]) currentCounts[regulation] = {};
    currentCounts[regulation][department] = count;
    return { cgpaSemesterCount: currentCounts };
  }),
   
   getMasterSubjects: (reg) => {
     if (reg === 'R2021') {
       return Object.values(MASTER_R2021_SUBJECTS).map((s) => ({ ...(s as Subject), type: 'theory' })) as Subject[];
     }
     if (reg === 'R2025') {
       return Object.values(MASTER_R2025_SUBJECTS || {}).map((s) => ({ ...(s as Subject), type: 'theory' })) as Subject[];
     }
     return [];
   },

   getElectivePools: (reg) => {
     if (reg === 'R2021') {
       const pe = ALL_PROFESSIONAL_ELECTIVES.map(s => ({ ...s, type: 'elective_pe' })) as Subject[];
       return [...ALL_OPEN_ELECTIVES, ...pe, ...ALL_MANDATORY_COURSES];
     }
     return [];
   },

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
     
    const currentCounts = structuredClone(state.subjectCounts);
    if (currentCounts[regulation]?.[department]?.[sem]) {
      delete currentCounts[regulation][department][sem];
    }
     
    return { grades: currentGrades, selections: currentSelections, extraSubjects: currentExtra, subjectCounts: currentCounts };
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
     
    // For resetAll, we can just clear the entire subjectCounts for the current department
    const currentCounts = structuredClone(state.subjectCounts);
    if (currentCounts[regulation]?.[department]) {
      currentCounts[regulation][department] = {};
    }
     
    return { grades: currentGrades, selections: currentSelections, extraSubjects: currentExtra, subjectCounts: currentCounts };
  }),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
