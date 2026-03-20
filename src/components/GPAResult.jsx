export default function GPAResult({ gpa, totalCredits, totalSubjects, arrears, onSave, saved }) {
  if (totalSubjects === 0) return null

  const r = gpa.toFixed(2)
  let emoji = '🎉', msg = 'Outstanding!', tier = 'tier-s'
  if (gpa < 10) { emoji = '🎉'; msg = 'Outstanding!'; tier = 'tier-s'; }
  if (gpa < 9) { emoji = '🌟'; msg = 'Excellent!'; tier = 'tier-a'; }
  if (gpa < 8) { emoji = '👍'; msg = 'Very Good!'; tier = 'tier-b'; }
  if (gpa < 7) { emoji = '💪'; msg = 'Good, keep pushing!'; tier = 'tier-c'; }
  if (gpa < 6) { emoji = '📚'; msg = 'Room for improvement'; tier = 'tier-d'; }
  if (gpa < 5) { emoji = '⚠️'; msg = 'Needs improvement'; tier = 'tier-f'; }
  if (gpa === 0) { emoji = '—'; msg = 'Set grades to calculate'; tier = ''; }

  const percentage = gpa > 0 ? ((gpa - 0.75) * 10).toFixed(1) : null

  return (
    <div className={`result-card ${tier}`}>
      <div className="result-header">
        <span className="result-emoji">{emoji}</span>
        <div className="result-gpa">{r}</div>
        <div className="result-label">Semester GPA</div>
        <div className="result-msg">{msg}</div>
      </div>

      {percentage && (
        <div className="result-pct">
          ≈ {percentage}% (Equivalent Percentage)
        </div>
      )}

      {arrears > 0 && (
        <div className="result-alert result-alert-fail">
          🔴 {arrears} Arrear{arrears > 1 ? 's' : ''} detected
        </div>
      )}
      {arrears === 0 && gpa > 0 && (
        <div className="result-alert result-alert-pass">✅ All subjects passed!</div>
      )}

      <div className="result-stats">
        <div className="stat"><span className="stat-val">{totalSubjects}</span><span className="stat-lbl">Subjects</span></div>
        <div className="stat"><span className="stat-val">{totalCredits}</span><span className="stat-lbl">Credits</span></div>
        <div className="stat"><span className="stat-val">{(gpa * totalCredits).toFixed(0)}</span><span className="stat-lbl">Weighted</span></div>
      </div>

      {gpa > 0 && onSave && (
        <button
          className={`btn btn-primary btn-save ${saved ? 'btn-saved' : ''}`}
          onClick={onSave}
          disabled={saved}
        >
          {saved ? '✅ Saved' : '💾 Save to History'}
        </button>
      )}
    </div>
  )
}
