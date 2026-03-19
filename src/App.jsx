import { useState } from 'react'
import Navbar from './components/Navbar'
import Calculator from './pages/Calculator'
import CGPASection from './components/CGPASection'
import GradePredictor from './pages/Predictor'
import GradingInfo from './pages/GradingInfo'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('gpa')

  return (
    <div className="app">
      <Navbar activeTab={tab} onTabChange={setTab} />
      <main className="main">
        {tab === 'gpa' && <Calculator />}
        {tab === 'cgpa' && <CGPASection />}
        {tab === 'predictor' && <GradePredictor />}
        {tab === 'grading' && <GradingInfo />}
      </main>
      <footer className="footer">
        ⚡ GPAfy — All-in-one Academic Companion for Anna University Students
      </footer>
    </div>
  )
}
