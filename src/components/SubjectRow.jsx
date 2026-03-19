import GradeSelector from './GradeSelector'

export default function SubjectRow({ subject, index, onChange, onRemove }) {
  const hasFailure = subject.grade === 'U'

  return (
    <div className={`subject-row ${hasFailure ? 'subject-row-fail' : ''}`}>
      <div className="subject-row-num">{index + 1}</div>
      <div className="subject-row-fields">
        <input
          type="text"
          className="input subject-name-input"
          placeholder="Subject name"
          value={subject.name}
          onChange={e => onChange(index, 'name', e.target.value)}
        />
        <input
          type="number"
          className="input credits-input"
          placeholder="Cr"
          min="1"
          max="10"
          value={subject.credits}
          onChange={e => onChange(index, 'credits', e.target.value)}
        />
        <GradeSelector
          value={subject.grade}
          onChange={val => onChange(index, 'grade', val)}
        />
      </div>
      <button
        className="btn-icon btn-remove"
        onClick={() => onRemove(index)}
        title="Remove subject"
      >
        ✕
      </button>
      {hasFailure && <div className="subject-warning">⚠ Arrear — Grade U</div>}
    </div>
  )
}
