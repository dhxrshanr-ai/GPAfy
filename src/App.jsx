import { useState } from 'react'
import Navbar from './components/Navbar'
import Calculator from './pages/Calculator'
import CGPASection from './components/CGPASection'
import GradePredictor from './pages/Predictor'
import GradingInfo from './pages/GradingInfo'
import History from './pages/History'
import ResultAnalyzer from './pages/ResultAnalyzer'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('gpa')

  return (
    <div className="app">
      <Navbar activeTab={tab} onTabChange={setTab} />
      <main className="main">
        <div className="page-transition" key={tab}>
          {tab === 'gpa' && <Calculator />}
          {tab === 'cgpa' && <CGPASection />}
          {tab === 'predictor' && <GradePredictor />}
          {tab === 'analyzer' && <ResultAnalyzer />}
          {tab === 'history' && <History />}
          {tab === 'grading' && <GradingInfo />}
        </div>
      </main>
      <footer className="footer">
        ⚡ GPAfy — Production-Level GPA Companion for Anna University
      </footer>
    </div>
  )
}
