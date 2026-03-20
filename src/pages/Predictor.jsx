import { useState, useEffect } from 'react'
import GradeSelector from '../components/GradeSelector'
import { GRADE_OPTIONS, getGradePoint } from '../utils/gradePoints'
import { calculateGPA } from '../utils/calculateGPA'
import { loadData } from '../utils/storage'

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

  const loadFromCalculator = () => {
    const saved = loadData('gpa_subjects')
    if (!saved || saved.length === 0) return
    const loaded = saved
      .filter(s => s.name || s.credits)
      .map((s, i) => ({
        id: Date.now() + i,
        name: s.name || `Subject ${i + 1}`,
        credits: s.credits || '3',
        current: s.grade || '',
        predicted: s.grade || '',
      }))
    if (loaded.length > 0) setSubjects(loaded)
  }

  const delta = predictedGPA - currentGPA

  return (
    <div className="gpafy-page">
      <div className="section-header">
        <h2 className="section-title">Grade Predictor</h2>
        <p className="section-desc">"If I get A+ in Maths, what will my GPA be?"</p>
      </div>

      <div className="subject-card target-card">
        <div className="card-header">
          <span className="card-index">⚡ Simulation Dashboard</span>
        </div>
        <div className="predictor-comparison">
          <div className="s-stat">
            <span className="s-lbl">Current GPA</span>
            <span className="s-val">{currentGPA > 0 ? currentGPA.toFixed(2) : '—'}</span>
          </div>
          <div className="predictor-arrow">→</div>
          <div className={`s-stat ${delta > 0 ? 'text-teal' : delta < 0 ? 'text-error' : ''}`}>
            <span className="s-lbl">Predicted GPA</span>
            <span className="s-val">{predictedGPA > 0 ? predictedGPA.toFixed(2) : '—'}</span>
          </div>
          <div className={`s-stat ${delta > 0 ? 'text-teal' : delta < 0 ? 'text-error' : ''}`}>
            <span className="s-lbl">Change</span>
            <span className="s-val">
              {currentGPA > 0 && predictedGPA > 0 ? (delta >= 0 ? '+' : '') + delta.toFixed(2) : '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="subject-container">
        {subjects.map((sub, i) => (
          <div className="subject-card" key={sub.id}>
             <div className="card-header">
               <span className="card-index">Subject {i + 1}</span>
               {sub.credits && <span className="status-badge badge-default">{sub.credits} CREDITS</span>}
             </div>
             <div className="card-body">
               <div className="card-row">
                 <div className="input-group flex-2">
                   <label className="input-label">Subject Name</label>
                   <input
                     type="text"
                     className="input"
                     value={sub.name}
                     onChange={e => update(i, 'name', e.target.value)}
                   />
                 </div>
                 <div className="input-group flex-1">
                   <label className="input-label">Credits</label>
                   <input
                     type="number"
                     className="input credits-input-modern"
                     value={sub.credits}
                     onChange={e => update(i, 'credits', e.target.value)}
                     min="1" max="10"
                   />
                 </div>
               </div>
               <div className="card-row">
                 <div className="input-group flex-1">
                   <label className="input-label">Current Grade</label>
                   <GradeSelector value={sub.current} onChange={val => update(i, 'current', val)} />
                 </div>
                 <div className="input-group flex-1">
                   <label className="input-label">"What If" Grade</label>
                   <GradeSelector value={sub.predicted} onChange={val => update(i, 'predicted', val)} />
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>

      <div className="calc-actions" style={{ marginBottom: '40px' }}>
        <button className="btn btn-primary-modern" onClick={addSubject}>+ Add Entry</button>
        <button className="btn btn-outline-modern" onClick={loadFromCalculator}>📥 Sync from GPA</button>
        <button className="btn btn-outline-modern" onClick={() => setSubjects(DEFAULT_SUBS())}>Reset</button>
      </div>
    </div>
  )
}
