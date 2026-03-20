import { useState, useEffect } from 'react'
import { loadData, saveData, clearData } from '../utils/storage'

function Sparkline({ data, width = 320, height = 80 }) {
  if (!data || data.length < 2) return null

  const padding = 8
  const w = width - padding * 2
  const h = height - padding * 2
  const maxGpa = 10
  const minGpa = 0

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * w
    const y = padding + h - ((d.gpa - minGpa) / (maxGpa - minGpa)) * h
    return { x, y, gpa: d.gpa }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding + h} L ${points[0].x} ${padding + h} Z`

  return (
    <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(124,92,252,0.3)" />
          <stop offset="100%" stopColor="rgba(124,92,252,0)" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c5cfc" />
          <stop offset="100%" stopColor="#00d4aa" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[2, 4, 6, 8, 10].map(v => {
        const y = padding + h - ((v - minGpa) / (maxGpa - minGpa)) * h
        return <line key={v} x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(42,42,58,0.5)" strokeWidth="0.5" />
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#sparkGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#16161f" stroke="#7c5cfc" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#9b7fff" fontSize="9" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">
            {p.gpa.toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function History() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const data = loadData('gpa_history') || []
    setHistory(data)
  }, [])

  const deleteEntry = (id) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    saveData('gpa_history', updated)
  }

  const clearAll = () => {
    setHistory([])
    clearData('gpa_history')
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const avgGPA = history.length > 0
    ? (history.reduce((a, h) => a + h.gpa, 0) / history.length).toFixed(2)
    : '—'

  const bestGPA = history.length > 0
    ? Math.max(...history.map(h => h.gpa)).toFixed(2)
    : '—'

  return (
    <div className="history-page">
      <div className="section-header">
        <h2 className="section-title">GPA History</h2>
        <p className="section-desc">Track your academic progress over time</p>
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">📭</span>
          <p className="history-empty-text">No saved results yet</p>
          <p className="history-empty-hint">Calculate your GPA and click "Save to History" to start tracking</p>
        </div>
      ) : (
        <>
          {/* Stats overview */}
          <div className="history-stats-row">
            <div className="history-stat-card">
              <span className="history-stat-icon">📊</span>
              <div className="history-stat-value">{history.length}</div>
              <div className="history-stat-label">Saved Entries</div>
            </div>
            <div className="history-stat-card">
              <span className="history-stat-icon">📈</span>
              <div className="history-stat-value">{avgGPA}</div>
              <div className="history-stat-label">Average GPA</div>
            </div>
            <div className="history-stat-card">
              <span className="history-stat-icon">🏆</span>
              <div className="history-stat-value">{bestGPA}</div>
              <div className="history-stat-label">Best GPA</div>
            </div>
          </div>

          {/* Sparkline chart */}
          {history.length >= 2 && (
            <div className="history-chart-card">
              <h3 className="history-chart-title">📈 GPA Trend</h3>
              <Sparkline data={history} />
            </div>
          )}

          {/* History list */}
          <div className="history-list">
            {[...history].reverse().map((entry, i) => {
              const idx = history.length - i
              let tier = ''
              if (entry.gpa >= 9) tier = 'history-tier-s'
              else if (entry.gpa >= 8) tier = 'history-tier-a'
              else if (entry.gpa >= 7) tier = 'history-tier-b'
              else tier = 'history-tier-c'

              return (
                <div className={`history-entry ${tier}`} key={entry.id}>
                  <div className="history-entry-num">#{idx}</div>
                  <div className="history-entry-info">
                    <div className="history-entry-gpa">{entry.gpa.toFixed(2)}</div>
                    <div className="history-entry-meta">
                      {entry.subjects} subjects · {entry.credits} credits · {formatDate(entry.date)}
                    </div>
                  </div>
                  <button
                    className="btn-icon btn-remove"
                    onClick={() => deleteEntry(entry.id)}
                    title="Delete entry"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>

          <div className="action-bar" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={clearAll}>🗑 Clear All History</button>
          </div>
        </>
      )}
    </div>
  )
}
