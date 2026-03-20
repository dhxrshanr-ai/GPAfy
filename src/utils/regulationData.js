/*
 * GPAfy — Regulation Data Index
 * Central registry of all Anna University regulation data
 * Supports R2017 and R2021 with 13+ departments
 */

import { R2017_SEM1_COMMON, R2017_SEM2_COMMON } from './regulations/common'
import { CSE, ECE, IT, AIDS, CSBS, CSD, CSE_CS, AIML } from './regulations/r2021_depts'
import { EEE, MECH, CIVIL, BME, MECT } from './regulations/r2021_depts2'
import {
  CSE_PROFESSIONAL_ELECTIVES,
  ECE_PROFESSIONAL_ELECTIVES,
  EEE_PROFESSIONAL_ELECTIVES,
  MECH_PROFESSIONAL_ELECTIVES,
  OPEN_ELECTIVES,
  HONORS_INFO,
} from './regulations/electives'

/* ─── R2017 (Legacy) ─── */
const R2017_CSE = {
  name: 'Computer Science & Engineering',
  semesters: {
    1: R2017_SEM1_COMMON,
    2: R2017_SEM2_COMMON,
    3: [
      { code: 'MA8351', name: 'Discrete Mathematics', credits: 4, type: 'theory' },
      { code: 'CS8351', name: 'Digital Principles & System Design', credits: 4, type: 'theory' },
      { code: 'CS8391', name: 'Data Structures', credits: 3, type: 'theory' },
      { code: 'CS8392', name: 'Object Oriented Programming', credits: 3, type: 'theory' },
      { code: 'EC8395', name: 'Communication Engineering', credits: 3, type: 'theory' },
      { code: 'CS8381', name: 'Data Structures Lab', credits: 2, type: 'lab' },
      { code: 'CS8383', name: 'Object Oriented Programming Lab', credits: 2, type: 'lab' },
    ],
    4: [
      { code: 'MA8402', name: 'Probability & Queuing Theory', credits: 4, type: 'theory' },
      { code: 'CS8491', name: 'Computer Architecture', credits: 4, type: 'theory' },
      { code: 'CS8492', name: 'Database Management Systems', credits: 3, type: 'theory' },
      { code: 'CS8451', name: 'Design & Analysis of Algorithms', credits: 3, type: 'theory' },
      { code: 'CS8493', name: 'Operating Systems', credits: 3, type: 'theory' },
      { code: 'CS8494', name: 'Software Engineering', credits: 3, type: 'theory' },
      { code: 'CS8481', name: 'Database Management Systems Lab', credits: 2, type: 'lab' },
      { code: 'CS8461', name: 'Operating Systems Lab', credits: 2, type: 'lab' },
    ],
    5: [
      { code: 'MA8551', name: 'Algebra & Number Theory', credits: 4, type: 'theory' },
      { code: 'CS8591', name: 'Computer Networks', credits: 3, type: 'theory' },
      { code: 'CS8501', name: 'Theory of Computation', credits: 3, type: 'theory' },
      { code: 'CS8592', name: 'Object Oriented Analysis & Design', credits: 3, type: 'theory' },
      { code: 'EC8691', name: 'Microprocessors & Microcontrollers', credits: 3, type: 'theory' },
      { code: 'CSXXXX', name: 'Open Elective I', credits: 3, type: 'elective' },
      { code: 'CS8581', name: 'Networks Lab', credits: 2, type: 'lab' },
      { code: 'EC8681', name: 'Microprocessors & Microcontrollers Lab', credits: 2, type: 'lab' },
    ],
    6: [
      { code: 'CS8651', name: 'Internet Programming', credits: 3, type: 'theory' },
      { code: 'CS8691', name: 'Artificial Intelligence', credits: 3, type: 'theory' },
      { code: 'CS8601', name: 'Mobile Computing', credits: 3, type: 'theory' },
      { code: 'CS8602', name: 'Compiler Design', credits: 3, type: 'theory' },
      { code: 'CS86XX', name: 'Professional Elective I', credits: 3, type: 'elective' },
      { code: 'CSXXYY', name: 'Open Elective II', credits: 3, type: 'elective' },
      { code: 'CS8611', name: 'Mini Project', credits: 1, type: 'lab' },
      { code: 'CS8661', name: 'Internet Programming Lab', credits: 2, type: 'lab' },
      { code: 'CS8662', name: 'Mobile Application Development Lab', credits: 2, type: 'lab' },
    ],
    7: [
      { code: 'CS8791', name: 'Cloud Computing', credits: 3, type: 'theory' },
      { code: 'CS8792', name: 'Cryptography & Network Security', credits: 3, type: 'theory' },
      { code: 'CS87XX', name: 'Professional Elective II', credits: 3, type: 'elective' },
      { code: 'CS87YY', name: 'Professional Elective III', credits: 3, type: 'elective' },
      { code: 'CS87ZZ', name: 'Professional Elective IV', credits: 3, type: 'elective' },
      { code: 'CS8711', name: 'Cloud Computing Lab', credits: 2, type: 'lab' },
      { code: 'HS8581', name: 'Professional Communication', credits: 1, type: 'theory' },
    ],
    8: [
      { code: 'CS88XX', name: 'Professional Elective V', credits: 3, type: 'elective' },
      { code: 'CS88YY', name: 'Professional Elective VI', credits: 3, type: 'elective' },
      { code: 'CS8811', name: 'Project Work / Dissertation', credits: 10, type: 'lab' },
    ],
  },
}

const R2017_ECE = {
  name: 'Electronics & Communication Engineering',
  semesters: {
    1: R2017_SEM1_COMMON,
    2: R2017_SEM2_COMMON,
    3: [
      { code: 'MA8352', name: 'Linear Algebra & PDE', credits: 4, type: 'theory' },
      { code: 'EC8351', name: 'Electronic Circuits I', credits: 3, type: 'theory' },
      { code: 'EC8352', name: 'Signals & Systems', credits: 3, type: 'theory' },
      { code: 'EC8391', name: 'Control Systems Engineering', credits: 3, type: 'theory' },
      { code: 'EC8392', name: 'Digital Electronics', credits: 4, type: 'theory' },
      { code: 'EC8361', name: 'Analog & Digital Circuits Lab', credits: 2, type: 'lab' },
      { code: 'EC8381', name: 'Fundamentals of Data Structures in C', credits: 3, type: 'theory' },
    ],
    4: [
      { code: 'MA8451', name: 'Probability & Random Processes', credits: 4, type: 'theory' },
      { code: 'EC8452', name: 'Electronic Circuits II', credits: 3, type: 'theory' },
      { code: 'EC8491', name: 'Communication Theory', credits: 4, type: 'theory' },
      { code: 'EC8451', name: 'Electromagnetic Fields', credits: 3, type: 'theory' },
      { code: 'EC8453', name: 'Linear Integrated Circuits', credits: 3, type: 'theory' },
      { code: 'EC8461', name: 'Circuits Design & Simulation Lab', credits: 2, type: 'lab' },
      { code: 'EC8462', name: 'Linear Integrated Circuits Lab', credits: 2, type: 'lab' },
    ],
    5: [
      { code: 'EC8553', name: 'Discrete-Time Signal Processing', credits: 3, type: 'theory' },
      { code: 'EC8552', name: 'Computer Architecture & Organization', credits: 4, type: 'theory' },
      { code: 'EC8551', name: 'Communication Networks', credits: 3, type: 'theory' },
      { code: 'EC8501', name: 'Digital Communication', credits: 3, type: 'theory' },
      { code: 'EC8591', name: 'VLSI Design', credits: 3, type: 'theory' },
      { code: 'EC8561', name: 'Communication Systems Lab', credits: 2, type: 'lab' },
      { code: 'EC8562', name: 'DSP & Digital Comm. Lab', credits: 2, type: 'lab' },
    ],
    6: [
      { code: 'EC8651', name: 'Transmission Lines & RF Systems', credits: 3, type: 'theory' },
      { code: 'EC8652', name: 'Wireless Communication', credits: 3, type: 'theory' },
      { code: 'EC8691', name: 'Microprocessors & Microcontrollers', credits: 3, type: 'theory' },
      { code: 'EC86XX', name: 'Professional Elective I', credits: 3, type: 'elective' },
      { code: 'EC86YY', name: 'Open Elective I', credits: 3, type: 'elective' },
      { code: 'EC8681', name: 'Microprocessors & Microcontrollers Lab', credits: 2, type: 'lab' },
      { code: 'EC8661', name: 'VLSI Design Lab', credits: 2, type: 'lab' },
    ],
    7: [
      { code: 'EC8791', name: 'Embedded & Real Time Systems', credits: 3, type: 'theory' },
      { code: 'EC8792', name: 'Antenna & Wave Propagation', credits: 3, type: 'theory' },
      { code: 'EC87XX', name: 'Professional Elective II', credits: 3, type: 'elective' },
      { code: 'EC87YY', name: 'Professional Elective III', credits: 3, type: 'elective' },
      { code: 'EC87ZZ', name: 'Professional Elective IV', credits: 3, type: 'elective' },
      { code: 'EC87WW', name: 'Open Elective II', credits: 3, type: 'elective' },
      { code: 'EC8711', name: 'Embedded Systems Lab', credits: 2, type: 'lab' },
    ],
    8: [
      { code: 'EC88XX', name: 'Professional Elective V', credits: 3, type: 'elective' },
      { code: 'EC88YY', name: 'Professional Elective VI', credits: 3, type: 'elective' },
      { code: 'EC8811', name: 'Project Work / Dissertation', credits: 10, type: 'lab' },
    ],
  },
}

/* ─── Master Registry ─── */
export const regulationData = {
  R2021: {
    CSE, ECE, IT, AIDS, CSBS, CSD,
    'CSE-CS': CSE_CS,
    'CSE-AIML': AIML,
    EEE, MECH, CIVIL, BME, MECT,
  },
  R2017: {
    CSE: R2017_CSE,
    ECE: R2017_ECE,
  },
}

/* Labels for dropdowns */
export const regulationLabels = {
  R2021: 'R2021 (Latest)',
  R2017: 'R2017 (Legacy)',
}

export const departmentLabels = {
  CSE: 'CSE — Computer Science & Engineering',
  ECE: 'ECE — Electronics & Communication',
  IT: 'IT — Information Technology',
  AIDS: 'AI&DS — Artificial Intelligence & Data Science',
  CSBS: 'CSBS — Computer Science & Business Systems',
  CSD: 'CSD — Computer Science & Design',
  'CSE-CS': 'CSE (CS) — Cyber Security',
  'CSE-AIML': 'CSE (AIML) — AI & Machine Learning',
  EEE: 'EEE — Electrical & Electronics',
  MECH: 'MECH — Mechanical Engineering',
  CIVIL: 'CIVIL — Civil Engineering',
  BME: 'BME — Biomedical Engineering',
  MECT: 'MECT — Mechatronics Engineering',
}

/* Export electives and honors for the Electives tab */
export {
  CSE_PROFESSIONAL_ELECTIVES,
  ECE_PROFESSIONAL_ELECTIVES,
  EEE_PROFESSIONAL_ELECTIVES,
  MECH_PROFESSIONAL_ELECTIVES,
  OPEN_ELECTIVES,
  HONORS_INFO,
}
