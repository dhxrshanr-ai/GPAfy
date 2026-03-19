// Anna University Grade System
export const GRADES = [
  { grade: 'O',  label: 'Outstanding',   point: 10, min: 91, max: 100 },
  { grade: 'A+', label: 'Excellent',     point: 9,  min: 81, max: 90 },
  { grade: 'A',  label: 'Very Good',     point: 8,  min: 71, max: 80 },
  { grade: 'B+', label: 'Good',          point: 7,  min: 61, max: 70 },
  { grade: 'B',  label: 'Average',       point: 6,  min: 51, max: 60 },
  { grade: 'C',  label: 'Satisfactory',  point: 5,  min: 45, max: 50 },
  { grade: 'U',  label: 'Re-Appear',     point: 0,  min: 0,  max: 44 },
]

export const GRADE_OPTIONS = GRADES.map(g => g.grade)

export function getGradePoint(grade) {
  const g = GRADES.find(x => x.grade === grade)
  return g ? g.point : 0
}

export function getGradeFromMarks(marks) {
  if (marks < 0 || marks > 100) return null
  const g = GRADES.find(x => marks >= x.min && marks <= x.max)
  return g ? g.grade : 'U'
}
