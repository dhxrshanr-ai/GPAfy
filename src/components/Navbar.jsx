export default function Navbar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'gpa', label: 'GPA', icon: '📊' },
    { id: 'cgpa', label: 'CGPA', icon: '📈' },
    { id: 'predictor', label: 'Predictor', icon: '🎯' },
    { id: 'analyzer', label: 'Analyzer', icon: '🔍' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'grading', label: 'Grading', icon: 'ℹ️' },
  ]

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a className="nav-logo" href="#" onClick={e => { e.preventDefault(); onTabChange('gpa') }}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">GPAfy</span>
        </a>
        <div className="nav-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              id={`nav-${t.id}`}
              className={`nav-tab ${activeTab === t.id ? 'nav-tab-active' : ''}`}
              onClick={() => onTabChange(t.id)}
            >
              <span className="nav-tab-icon">{t.icon}</span>
              <span className="nav-tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
