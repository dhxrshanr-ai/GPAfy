import { useState, useEffect } from 'react'
import { calculateCGPA } from '../utils/calculateGPA'
import { saveData, loadData } from '../utils/storage'

const EMPTY_SEMS = () => Array.from({ length: 8 }, (_, i) => ({ id: i + 1, gpa: '', credits: '' }))

export default function CGPASection() {
  const [semesters, setSemesters] = useState(() => loadData('cgpa_sems') || EMPTY_SEMS())
  const [cgpa, setCGPA] = useState(0)

  useEffect(() => {
    saveData('cgpa_sems', semesters)
    setCGPA(calculateCGPA(semesters))
  }, [semesters])

  const update = (idx, field, val) => {
    setSemesters(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))
  }

  const duplicateSem = () => {
    const lastFilled = [...semesters].reverse().find(s => Number(s.credits) > 0)
    if (!lastFilled) return
    const nextEmpty = semesters.findIndex(s => !s.credits || Number(s.credits) <= 0)
    if (nextEmpty === -1) return
    setSemesters(prev => prev.map((s, i) => i === nextEmpty ? { ...s, credits: lastFilled.credits } : s))
  }

  const reset = () => setSemesters(EMPTY_SEMS())

  const activeSems = semesters.filter(s => Number(s.gpa) > 0 && Number(s.credits) > 0)
  const totalCr = activeSems.reduce((a, s) => a + Number(s.credits), 0)
  const pct = cgpa > 0 ? ((cgpa - 0.75) * 10).toFixed(1) : '0.0'

  return (
    <div className="cgpa-section">
      <div className="section-header">
        <h2 className="section-title">CGPA Calculator</h2>
        <p className="section-desc">Enter GPA and credits for each completed semester</p>
      </div>

      <div className="cgpa-grid">
        {semesters.map((sem, i) => (
          <div className="cgpa-card" key={sem.id}>
            <div className="cgpa-card-label">Semester {sem.id}</div>
            <div className="cgpa-card-inputs">
              <div className="input-group">
                <label>GPA</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  min="0" max="10" step="0.01"
                  value={sem.gpa}
                  onChange={e => update(i, 'gpa', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Credits</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  min="0" max="40"
                  value={sem.credits}
                  onChange={e => update(i, 'credits', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={duplicateSem}>📋 Duplicate Credits</button>
        <button className="btn btn-outline" onClick={reset}>Reset</button>
      </div>

      {cgpa > 0 && (
        <div className="result-card tier-cgpa">
          <div className="result-header">
            <div className="result-gpa">{cgpa.toFixed(2)}</div>
            <div className="result-label">Cumulative CGPA</div>
          </div>
          <div className="result-stats">
            <div className="stat"><span className="stat-val">{activeSems.length}</span><span className="stat-lbl">Semesters</span></div>
            <div className="stat"><span className="stat-val">{totalCr}</span><span className="stat-lbl">Credits</span></div>
            <div className="stat"><span className="stat-val">{pct}%</span><span className="stat-lbl">Percentage</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
