export type SubjectCategory = 'theory' | 'lab' | 'project' | 'elective_pe' | 'elective_oe' | 'mandatory' | 'internship';

export type Subject = {
  code: string;
  name: string;
  credits: number;
  type: SubjectCategory;
  isProvisional?: boolean;
  electiveGroupId?: string;
  isNccCourse?: boolean;
  options?: Subject[];
  selectedOption?: Subject;
  slotCode?: string;  // for manual slots: the original SLOT_X_Y identifier used as grade key
};

export type Semester = {
  sem: number;
  subjects: Subject[];
};

export type Department = {
  dept: string;
  semesters: Semester[];
};

export type Regulation = {
  reg: 'R2013' | 'R2017' | 'R2021' | 'R2025';
  departments: Department[];
};
