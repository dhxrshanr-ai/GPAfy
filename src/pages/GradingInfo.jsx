import { GRADES } from '../utils/gradePoints'

export default function GradingInfo() {
  return (
    <div className="grading-page">
      <div className="section-header">
        <h2 className="section-title">Grading System</h2>
        <p className="section-desc">Anna University 10-point grading scale</p>
      </div>

      <div className="grading-table-wrap">
        <table className="grading-table">
          <thead>
            <tr><th>Grade</th><th>Description</th><th>Marks</th><th>Point</th></tr>
          </thead>
          <tbody>
            {GRADES.map(g => (
              <tr key={g.grade} className={g.grade === 'U' ? 'row-fail' : ''}>
                <td><span className={`grade-badge gb-${g.grade.replace('+', 'p')}`}>{g.grade}</span></td>
                <td>{g.label}</td>
                <td>{g.min}–{g.max}</td>
                <td className="text-center"><strong>{g.point}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="formula-grid">
        <div className="formula-card">
          <h3>📐 GPA Formula</h3>
          <div className="formula-box">
            <div className="formula-frac">
              <span className="frac-num">Σ (Credit × Grade Point)</span>
              <span className="frac-line"></span>
              <span className="frac-den">Σ (Credits)</span>
            </div>
          </div>
          <p className="formula-note">Sum of credit-weighted grade points divided by total credits.</p>
        </div>
        <div className="formula-card">
          <h3>📊 CGPA Formula</h3>
          <div className="formula-box">
            <div className="formula-frac">
              <span className="frac-num">Σ (Semester Credits × GPA)</span>
              <span className="frac-line"></span>
              <span className="frac-den">Σ (All Credits)</span>
            </div>
          </div>
          <p className="formula-note">Weighted average of all semester GPAs by credits.</p>
        </div>
        <div className="formula-card">
          <h3>📈 CGPA → Percentage</h3>
          <div className="formula-box">
            <code className="formula-code">% = (CGPA − 0.75) × 10</code>
          </div>
          <p className="formula-note">Example: CGPA 8.5 = 77.5%</p>
        </div>
      </div>
    </div>
  )
}
