import { useState, useEffect } from 'react'
import GradeSelector from '../components/GradeSelector'
import { GRADE_OPTIONS, getGradePoint } from '../utils/gradePoints'
import { calculateGPA } from '../utils/calculateGPA'

const DEFAULT_SUBS = () => [
  { id: 1, name: 'Subject 1', credits: '3', current: '', predicted: '' },
  { id: 2, name: 'Subject 2', credits: '3', current: '', predicted: '' },
  { id: 3, name: 'Subject 3', credits: '4', current: '', predicted: '' },
  { id: 4, name: 'Subject 4', credits: '3', current: '', predicted: '' },
  { id: 5, name: 'Subject 5', credits: '4', current: '', predicted: '' },
]

export default function GradePredictor() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBS)
  const [currentGPA, setCurrentGPA] = useState(0)
  const [predictedGPA, setPredictedGPA] = useState(0)

  useEffect(() => {
    const curr = subjects.map(s => ({ credits: s.credits, grade: s.current }))
    const pred = subjects.map(s => ({ credits: s.credits, grade: s.predicted || s.current }))
    setCurrentGPA(calculateGPA(curr))
    setPredictedGPA(calculateGPA(pred))
  }, [subjects])

  const update = (idx, field, val) => {
    setSubjects(prev => prev.map((s, i) => {
      if (i !== idx) return s
      const updated = { ...s, [field]: val }
      if (field === 'current' && !s.predicted) updated.predicted = val
      return updated
    }))
  }

  const addSubject = () => {
    setSubjects(prev => [...prev, { id: Date.now(), name: `Subject ${prev.length + 1}`, credits: '3', current: '', predicted: '' }])
  }

  const delta = predictedGPA - currentGPA

  return (
    <div className="predictor-page">
      <div className="section-header">
        <h2 className="section-title">Grade Predictor</h2>
        <p className="section-desc">"If I get A+ in Maths, what will my GPA be?"</p>
      </div>

      <div className="predictor-comparison">
        <div className="predictor-card predictor-current">
          <div className="predictor-label">Current GPA</div>
          <div className="predictor-value">{currentGPA > 0 ? currentGPA.toFixed(2) : '—'}</div>
        </div>
        <div className="predictor-arrow">→</div>
        <div className="predictor-card predictor-predicted">
          <div className="predictor-label">Predicted GPA</div>
          <div className="predictor-value">{predictedGPA > 0 ? predictedGPA.toFixed(2) : '—'}</div>
        </div>
        <div className={`predictor-card predictor-delta ${delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : ''}`}>
          <div className="predictor-label">Change</div>
          <div className="predictor-value">
            {currentGPA > 0 && predictedGPA > 0 ? (delta >= 0 ? '+' : '') + delta.toFixed(2) : '—'}
          </div>
        </div>
      </div>

      <div className="predictor-grid">
        {subjects.map((sub, i) => (
          <div className="predictor-row" key={sub.id}>
            <input
              type="text"
              className="input"
              value={sub.name}
              onChange={e => update(i, 'name', e.target.value)}
            />
            <input
              type="number"
              className="input credits-input"
              value={sub.credits}
              onChange={e => update(i, 'credits', e.target.value)}
              min="1" max="10" placeholder="Cr"
            />
            <div className="predictor-grade-pair">
              <div className="input-group">
                <label>Now</label>
                <GradeSelector value={sub.current} onChange={val => update(i, 'current', val)} />
              </div>
              <div className="input-group">
                <label>What If</label>
                <GradeSelector value={sub.predicted} onChange={val => update(i, 'predicted', val)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={addSubject}>+ Add Subject</button>
        <button className="btn btn-outline" onClick={() => setSubjects(DEFAULT_SUBS())}>Reset</button>
      </div>
    </div>
  )
}
