import { GRADE_OPTIONS } from '../utils/gradePoints'

export default function GradeSelector({ value, onChange, id }) {
  return (
    <select
      className={`grade-select ${value === 'U' ? 'grade-fail' : value ? 'grade-filled' : ''}`}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      id={id}
    >
      <option value="">Grade</option>
      {GRADE_OPTIONS.map(g => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  )
}
