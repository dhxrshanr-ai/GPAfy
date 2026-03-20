import { useState, useEffect, useRef } from 'react'
import { getCreditsFromSubjectCode, getSubjectNameFromCode, validateSubjectCode, saveOverride, saveToLearned } from '../utils/creditLookup'
import { findSuggestions } from '../utils/suggestionEngine'
import { GRADES } from '../utils/gradePoints'

export default function SubjectRow({ subject, index, subjects, onChange, onRemove }) {
  const [creditInfo, setCreditInfo] = useState({ source: 'none', type: '' })
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const codeRef = useRef(null)
  const suggestRef = useRef(null)

  // Auto-detect credits when code changes
  useEffect(() => {
    if (subject.code && subject.code.trim().length >= 2) {
      const result = getCreditsFromSubjectCode(subject.code)
      setCreditInfo({ source: result.source, type: result.type })
      
      if (!subject.isManualCredit) {
        onChange(index, 'credits', String(result.credits))
      }

      if (result.name && !subject.name) {
        onChange(index, 'name', result.name)
      }
    } else {
      setCreditInfo({ source: 'none', type: '' })
    }
  }, [subject.code])

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClick = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target) && !codeRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCodeChange = (val) => {
    const up = val.toUpperCase()
    onChange(index, 'code', up)
    
    // Fetch suggestions
    const hints = findSuggestions(val)
    setSuggestions(hints)
    setShowSuggestions(hints.length > 0)
  }

  const selectSuggestion = (s) => {
    onChange(index, 'code', s.code)
    onChange(index, 'name', s.name)
    onChange(index, 'credits', String(s.credits))
    setShowSuggestions(false)
  }

  const handleCreditsChange = (val) => {
    const num = Number(val)
    onChange(index, 'credits', val)
    onChange(index, 'isManualCredit', true)
    
    // Layer 3: Save as user override
    if (subject.code) {
      saveOverride(subject.code, num)
      // Layer 4: If it's a new subject name too, save to learned
      if (subject.name) {
        saveToLearned(subject.code, num, subject.name)
      }
    }
  }

  const handleNameChange = (val) => {
    onChange(index, 'name', val)
    if (subject.code && subject.credits) {
      saveToLearned(subject.code, subject.credits, val)
    }
  }

  const validation = validateSubjectCode(subject.code)
  const isFail = subject.grade === 'U'
  const detectedName = subject.code ? getSubjectNameFromCode(subject.code) : ''

  // Duplicate Check
  const isDuplicate = subjects?.some((s, i) => i !== index && s.code && s.code === subject.code)

  /* Status Badge Config */
  const getStatusBadge = () => {
    switch (creditInfo.source) {
      case 'database': return { label: 'VERIFIED', class: 'badge-verified' }
      case 'override': return { label: 'OVERRIDDEN', class: 'badge-override' }
      case 'learned': return { label: 'LEARNED', class: 'badge-learned' }
      case 'pattern': return { label: 'ESTIMATED', class: 'badge-estimated' }
      case 'default': return { label: 'DEFAULT', class: 'badge-default' }
      default: return null
    }
  }
  const badge = getStatusBadge()

  return (
    <div className={`subject-card ${isFail ? 'card-fail' : ''}`}>
      <div className="card-header">
        <span className="card-index">Subject {index + 1}</span>
        {badge && <span className={`status-badge ${badge.class}`}>{badge.label}</span>}
        <button className="btn-close" onClick={() => onRemove(index)} title="Remove">✕</button>
      </div>

      <div className="card-body">
        <div className="card-row">
          {/* Code Input */}
          <div className="input-group flex-2">
            <label className="input-label">Subject Code</label>
            <input
              ref={codeRef}
              type="text"
              className={`input code-input-modern ${subject.code && !validation.valid && subject.code.length >= 3 ? 'input-error' : ''}`}
              placeholder="e.g. CS3351"
              value={subject.code || ''}
              onChange={e => handleCodeChange(e.target.value)}
              onFocus={() => { if (suggestions.length) setShowSuggestions(true) }}
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="suggestion-menu" ref={suggestRef}>
                {suggestions.map((s, i) => (
                  <div key={i} className="suggestion-item" onClick={() => selectSuggestion(s)}>
                    <span className="sug-code">{s.code}</span>
                    <span className="sug-name">{s.name}</span>
                    <span className="sug-cr">({s.credits} CR)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credits Input */}
          <div className="input-group flex-1">
            <label className="input-label">Credits</label>
            <input
              type="number"
              className={`input credits-input-modern ${subject.isManualCredit ? 'credits-manual' : ''}`}
              placeholder="Cr"
              value={subject.credits || ''}
              onChange={e => handleCreditsChange(e.target.value)}
              min="0" max="15"
            />
          </div>
        </div>

        <div className="card-row">
          {/* Name Input */}
          <div className="input-group flex-3">
            <label className="input-label">Subject Name (Optional)</label>
            <input
              type="text"
              className="input name-input-modern"
              placeholder={detectedName || "Enter name..."}
              value={subject.name || ''}
              onChange={e => handleNameChange(e.target.value)}
            />
          </div>

          {/* Grade Dropdown */}
          <div className="input-group flex-2">
            <label className="input-label">Grade</label>
            <select
              className={`select grade-select-modern ${subject.grade === 'U' ? 'select-fail' : ''}`}
              value={subject.grade || ''}
              onChange={e => onChange(index, 'grade', e.target.value)}
            >
              <option value="">Select</option>
              {GRADES.map(g => (
                <option key={g.grade} value={g.grade}>{g.grade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {subject.code && !validation.valid && subject.code.length >= 3 && (
          <div className="card-alert alert-warn">⚠ {validation.message}</div>
        )}
        {isDuplicate && (
          <div className="card-alert alert-warn">⚠ Duplicate subject detected!</div>
        )}
        {creditInfo.source === 'default' && subject.code && (
          <div className="card-alert alert-info">ℹ Credits auto-assigned. Please verify.</div>
        )}
      </div>
    </div>
  )
}
