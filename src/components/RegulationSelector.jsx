import { useState } from 'react'
import { regulationData, regulationLabels, departmentLabels } from '../utils/regulationData'

export default function RegulationSelector({ onLoad }) {
  const [regulation, setRegulation] = useState('')
  const [department, setDepartment] = useState('')
  const [semester, setSemester] = useState('')

  const regKeys = Object.keys(regulationData)
  const deptKeys = regulation ? Object.keys(regulationData[regulation] || {}) : []
  const semKeys = regulation && department && regulationData[regulation]?.[department]
    ? Object.keys(regulationData[regulation][department].semesters).map(Number)
    : []

  const handleRegChange = (val) => {
    setRegulation(val)
    setDepartment('')
    setSemester('')
  }

  const handleDeptChange = (val) => {
    setDepartment(val)
    setSemester('')
  }

  const handleLoad = () => {
    if (regulation && department && semester) {
      onLoad(regulation, department, Number(semester))
    }
  }

  return (
    <div className="reg-selector">
      <div className="reg-selector-inner">
        <div className="reg-pill-group">
          <div className="reg-pill-item">
            <label className="reg-pill-label">Regulation</label>
            <select
              className="grade-select reg-dropdown"
              value={regulation}
              onChange={e => handleRegChange(e.target.value)}
              id="regulation-select"
            >
              <option value="">Select</option>
              {regKeys.map(r => (
                <option key={r} value={r}>{regulationLabels[r] || r}</option>
              ))}
            </select>
          </div>

          <div className="reg-pill-item">
            <label className="reg-pill-label">Department</label>
            <select
              className="grade-select reg-dropdown"
              value={department}
              onChange={e => handleDeptChange(e.target.value)}
              disabled={!regulation}
              id="department-select"
            >
              <option value="">Select</option>
              {deptKeys.map(d => (
                <option key={d} value={d}>{departmentLabels[d] || d}</option>
              ))}
            </select>
          </div>

          <div className="reg-pill-item">
            <label className="reg-pill-label">Semester</label>
            <select
              className="grade-select reg-dropdown"
              value={semester}
              onChange={e => setSemester(e.target.value)}
              disabled={!department}
              id="semester-select"
            >
              <option value="">Select</option>
              {semKeys.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary reg-load-btn"
          disabled={!regulation || !department || !semester}
          onClick={handleLoad}
          id="load-subjects-btn"
        >
          ⚡ Load Subjects
        </button>
      </div>
    </div>
  )
}
