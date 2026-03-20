import { useState, useCallback } from 'react'
import { GRADES, getGradeFromMarks, getGradePoint } from '../utils/gradePoints'
import { calculateGPA } from '../utils/calculateGPA'
import RegulationSelector from '../components/RegulationSelector'
import { regulationData } from '../utils/regulationData'

const newSubject = (name = '', credits = '', code = '') => ({
  id: Date.now() + Math.random(),
  code,
  name,
  credits,
  marks: '',
  grade: '',
  gradePoint: 0,
})

const DEFAULT_SUBS = () => [
  newSubject('Subject 1', '3'),
  newSubject('Subject 2', '3'),
  newSubject('Subject 3', '4'),
  newSubject('Subject 4', '3'),
  newSubject('Subject 5', '4'),
]

export default function ResultAnalyzer() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBS)
  const [gpa, setGpa] = useState(0)

  const recalc = (subs) => {
    const mapped = subs.map(s => ({ credits: s.credits, grade: s.grade }))
    setGpa(calculateGPA(mapped))
  }

  const updateMarks = useCallback((idx, marks) => {
    setSubjects(prev => {
      const updated = prev.map((s, i) => {
        if (i !== idx) return s
        const m = Number(marks)
        const grade = (marks !== '' && !isNaN(m)) ? getGradeFromMarks(m) || '' : ''
        const gradePoint = grade ? getGradePoint(grade) : 0
        return { ...s, marks, grade, gradePoint }
      })
      recalc(updated)
      return updated
    })
  }, [])

  const updateField = useCallback((idx, field, val) => {
    setSubjects(prev => {
      const updated = prev.map((s, i) => i === idx ? { ...s, [field]: val } : s)
      recalc(updated)
      return updated
    })
  }, [])

  const addSubject = () => setSubjects(prev => [...prev, newSubject()])

  const removeSubject = (idx) => {
    if (subjects.length <= 1) return
    setSubjects(prev => {
      const updated = prev.filter((_, i) => i !== idx)
      recalc(updated)
      return updated
    })
  }

  const handleTemplateLoad = (regulation, department, semester) => {
    const templateSubs = regulationData[regulation]?.[department]?.semesters?.[semester] || []
    if (templateSubs.length === 0) return
    const loaded = templateSubs.map(s => newSubject(s.name, String(s.credits), s.code))
    setSubjects(loaded)
    recalc(loaded)
  }

  const resetAll = () => {
    setSubjects(DEFAULT_SUBS())
    setGpa(0)
  }

  const filledCount = subjects.filter(s => s.grade).length
  const arrears = subjects.filter(s => s.grade === 'U').length
  const passCount = subjects.filter(s => s.grade && s.grade !== 'U').length
  const totalCredits = subjects.reduce((a, s) => a + (Number(s.credits) || 0), 0)

  return (
    <div className="analyzer-page">
      <div className="section-header">
        <h2 className="section-title">Result Analyzer</h2>
        <p className="section-desc">Enter marks → auto-detect grades, GPA, and arrears</p>
      </div>

      <RegulationSelector onLoad={handleTemplateLoad} />

      <div className="analyzer-grid">
        {subjects.map((sub, i) => {
          const isFail = sub.grade === 'U'
          const isPass = sub.grade && sub.grade !== 'U'
          return (
            <div className={`analyzer-row ${isFail ? 'analyzer-row-fail' : ''}`} key={sub.id}>
              <div className="analyzer-row-num">{i + 1}</div>
              <div className="analyzer-row-fields">
                {sub.code && <span className="analyzer-code-badge">{sub.code}</span>}
                <input
                  type="text"
                  className="input analyzer-name-input"
                  placeholder="Subject name"
                  value={sub.name}
                  onChange={e => updateField(i, 'name', e.target.value)}
                />
                <input
                  type="number"
                  className="input credits-input"
                  placeholder="Cr"
                  min="1" max="10"
                  value={sub.credits}
                  onChange={e => updateField(i, 'credits', e.target.value)}
                />
                <input
                  type="number"
                  className="input analyzer-marks-input"
                  placeholder="Marks"
                  min="0" max="100"
                  value={sub.marks}
                  onChange={e => updateMarks(i, e.target.value)}
                />
                <div className="analyzer-result-cell">
                  {sub.grade ? (
                    <span className={`grade-badge gb-${sub.grade.replace('+', 'p')}`}>{sub.grade}</span>
                  ) : (
                    <span className="analyzer-pending">—</span>
                  )}
                </div>
                <div className="analyzer-status-cell">
                  {isPass && <span className="analyzer-pass">✅ Pass</span>}
                  {isFail && <span className="analyzer-fail">❌ Fail</span>}
                </div>
              </div>
              <button className="btn-icon btn-remove" onClick={() => removeSubject(i)} title="Remove">✕</button>
            </div>
          )
        })}
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={addSubject}>+ Add Subject</button>
        <button className="btn btn-outline" onClick={resetAll}>Reset All</button>
        <span className="action-info">{filledCount}/{subjects.length} analyzed · {totalCredits} credits</span>
      </div>

      {filledCount > 0 && (
        <div className={`result-card ${arrears > 0 ? '' : 'tier-s'}`}>
          <div className="result-header">
            <span className="result-emoji">{arrears > 0 ? '⚠️' : '🎉'}</span>
            <div className="result-gpa">{gpa.toFixed(2)}</div>
            <div className="result-label">Calculated GPA</div>
          </div>

          {arrears > 0 && (
            <div className="result-alert result-alert-fail">
              🔴 {arrears} Arrear{arrears > 1 ? 's' : ''} detected — Re-appearance required
            </div>
          )}
          {arrears === 0 && (
            <div className="result-alert result-alert-pass">✅ All subjects passed!</div>
          )}

          <div className="result-stats">
            <div className="stat"><span className="stat-val">{filledCount}</span><span className="stat-lbl">Analyzed</span></div>
            <div className="stat"><span className="stat-val">{passCount}</span><span className="stat-lbl">Passed</span></div>
            <div className="stat"><span className="stat-val">{arrears}</span><span className="stat-lbl">Arrears</span></div>
            <div className="stat"><span className="stat-val">{totalCredits}</span><span className="stat-lbl">Credits</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
