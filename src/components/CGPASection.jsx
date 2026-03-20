import { useState, useEffect } from 'react'
import { calculateCGPA } from '../utils/calculateGPA'
import { saveData, loadData } from '../utils/storage'

const EMPTY_SEMS = () => Array.from({ length: 8 }, (_, i) => ({ id: i + 1, gpa: '', credits: '' }))

export default function CGPASection() {
  const [semesters, setSemesters] = useState(() => loadData('cgpa_sems') || EMPTY_SEMS())
  const [cgpa, setCGPA] = useState(0)
  const [targetCGPA, setTargetCGPA] = useState('')

  useEffect(() => {
    saveData('cgpa_sems', semesters)
    setCGPA(calculateCGPA(semesters))
  }, [semesters])

  const update = (idx, field, val) => {
    setSemesters(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))
  }

  const reset = () => {
    setSemesters(EMPTY_SEMS())
    setTargetCGPA('')
  }

  const activeSems = semesters.filter(s => Number(s.gpa) > 0 && Number(s.credits) > 0)
  const totalCr = activeSems.reduce((a, s) => a + Number(s.credits), 0)
  
  // Target CGPA Logic
  const emptySems = semesters.filter(s => !s.gpa || Number(s.gpa) <= 0)
  const remainingSemsMatch = semesters.filter(s => !s.gpa || Number(s.gpa) <= 0)
  
  let targetMessage = ''
  if (targetCGPA && emptySems.length > 0) {
    const target = parseFloat(targetCGPA)
    // Assumption: Future semesters have an average of 25 credits each if not specified
    const estRemainingCredits = emptySems.length * 22 
    const currentPoints = activeSems.reduce((a, s) => a + (Number(s.gpa) * Number(s.credits)), 0)
    const totalEstCredits = totalCr + estRemainingCredits
    
    const requiredPoints = (target * totalEstCredits) - currentPoints
    const avgNeeded = (requiredPoints / estRemainingCredits).toFixed(2)
    
    if (avgNeeded > 10) targetMessage = "Target too high! 🚩"
    else if (avgNeeded <= 0) targetMessage = "Target already met! 🏆"
    else targetMessage = `Need avg ${avgNeeded} GPA in next ${emptySems.length} sems`
  }

  return (
    <div className="gpafy-page">
      <div className="section-header">
        <h2 className="section-title">CGPA Hub</h2>
        <p className="section-desc">Track your long-term academic progress</p>
      </div>

      {/* Target CGPA Card */}
      <div className="subject-card target-card">
        <div className="card-header">
          <span className="card-index">🎯 Graduation Goal</span>
        </div>
        <div className="card-row">
          <div className="input-group flex-1">
            <label className="input-label">Target CGPA</label>
            <input 
              type="number" 
              className="input" 
              placeholder="e.g. 8.5"
              value={targetCGPA}
              onChange={e => setTargetCGPA(e.target.value)}
              step="0.01"
            />
          </div>
          <div className="target-result flex-2">
            <span className="target-msg">{targetMessage || "Enter target to calculate future requirements"}</span>
          </div>
        </div>
      </div>

      <div className="subject-container">
        {semesters.map((sem, i) => (
          <div className={`subject-card ${Number(sem.gpa) > 0 ? '' : 'card-empty'}`} key={sem.id}>
            <div className="card-header">
              <span className="card-index">Semester {sem.id}</span>
              {Number(sem.gpa) >= 9 && <span className="status-badge badge-verified">GOLDEN</span>}
            </div>
            <div className="card-body">
              <div className="card-row">
                <div className="input-group flex-1">
                  <label className="input-label">GPA</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0.00"
                    value={sem.gpa}
                    onChange={e => update(i, 'gpa', e.target.value)}
                  />
                </div>
                <div className="input-group flex-1">
                  <label className="input-label">Credits</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 24"
                    value={sem.credits}
                    onChange={e => update(i, 'credits', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="calc-actions" style={{ marginBottom: '140px' }}>
        <button className="btn btn-outline-modern" onClick={reset}>Reset All Semesters</button>
        <div className="calc-stats-inline">
          <span>{activeSems.length} sems active</span>
          <span>•</span>
          <span>{totalCr} total credits</span>
        </div>
      </div>

      {/* Sticky Bottom CGPA Summary */}
      <div className="sticky-results">
        <div className="sticky-results-inner">
          <div className="result-main">
            <span className="result-value">{cgpa.toFixed(2)}</span>
            <span className="result-tag">Current CGPA</span>
          </div>
          
          <div className="sticky-stats">
            <div className="s-stat">
              <span className="s-val">{((cgpa > 0 ? (cgpa - 0.75) * 10 : 0)).toFixed(1)}%</span>
              <span className="s-lbl">Percentage</span>
            </div>
            <div className="s-stat">
              <span className="s-val">{totalCr}</span>
              <span className="s-lbl">Credits</span>
            </div>
          </div>

          <button className="btn-save-modern" onClick={() => alert('CGPA progress is auto-saved!')}>
            Auto-Saved
          </button>
        </div>
      </div>
    </div>
  )
}
