import { useState, useEffect, useCallback } from 'react'
import SubjectRow from '../components/SubjectRow'
import GPAResult from '../components/GPAResult'
import { calculateGPA } from '../utils/calculateGPA'
import { saveData, loadData } from '../utils/storage'

const newSubject = () => ({ id: Date.now() + Math.random(), name: '', credits: '', grade: '' })
const DEFAULT_SUBJECTS = () => [newSubject(), newSubject(), newSubject(), newSubject(), newSubject()]

export default function Calculator() {
  const [subjects, setSubjects] = useState(() => loadData('gpa_subjects') || DEFAULT_SUBJECTS())
  const [gpa, setGPA] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    saveData('gpa_subjects', subjects)
    setGPA(calculateGPA(subjects))
    setSaved(false)
  }, [subjects])

  const updateSubject = useCallback((idx, field, value) => {
    setSubjects(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }, [])

  const addSubject = () => setSubjects(prev => [...prev, newSubject()])

  const removeSubject = (idx) => {
    if (subjects.length <= 1) return
    setSubjects(prev => prev.filter((_, i) => i !== idx))
  }

  const resetAll = () => setSubjects(DEFAULT_SUBJECTS())

  const totalCr = subjects.reduce((a, s) => a + (Number(s.credits) || 0), 0)
  const filledCount = subjects.filter(s => s.grade && s.credits).length
  const arrears = subjects.filter(s => s.grade === 'U').length

  const handleSave = () => {
    const history = loadData('gpa_history') || []
    history.push({
      id: Date.now(),
      date: new Date().toISOString(),
      gpa,
      credits: totalCr,
      subjects: subjects.length,
    })
    saveData('gpa_history', history)
    setSaved(true)
  }

  return (
    <div className="calculator-page">
      <div className="section-header">
        <h2 className="section-title">GPA Calculator</h2>
        <p className="section-desc">Add subjects, select credits & grades — GPA updates automatically</p>
      </div>

      <div className="subject-list">
        {subjects.map((sub, i) => (
          <SubjectRow
            key={sub.id}
            subject={sub}
            index={i}
            onChange={updateSubject}
            onRemove={removeSubject}
          />
        ))}
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={addSubject}>+ Add Subject</button>
        <button className="btn btn-outline" onClick={resetAll}>Reset All</button>
        <span className="action-info">{filledCount}/{subjects.length} filled · {totalCr} credits</span>
      </div>

      <GPAResult
        gpa={gpa}
        totalCredits={totalCr}
        totalSubjects={filledCount}
        arrears={arrears}
        onSave={handleSave}
        saved={saved}
      />
    </div>
  )
}
