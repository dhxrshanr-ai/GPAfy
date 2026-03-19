import { getGradePoint } from './gradePoints'

export function calculateGPA(subjects) {
  let totalCredits = 0
  let weightedSum = 0

  for (const sub of subjects) {
    if (!sub.grade || sub.grade === '' || !sub.credits) continue
    const cr = Number(sub.credits)
    if (cr <= 0) continue
    totalCredits += cr
    weightedSum += cr * getGradePoint(sub.grade)
  }

  return totalCredits === 0 ? 0 : weightedSum / totalCredits
}

export function calculateCGPA(semesters) {
  let totalCredits = 0
  let weightedSum = 0

  for (const sem of semesters) {
    const gpa = Number(sem.gpa)
    const cr = Number(sem.credits)
    if (!gpa || gpa <= 0 || !cr || cr <= 0) continue
    totalCredits += cr
    weightedSum += cr * gpa
  }

  return totalCredits === 0 ? 0 : weightedSum / totalCredits
}
