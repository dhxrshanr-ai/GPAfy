import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  LayoutDashboard, 
  Target as TargetIcon, 
  TrendingUp, 
  Settings,
  GraduationCap,
  Plus,
  BookOpen,
  Trophy,
  X,
  Check
} from 'lucide-react';
import { GlassCard } from './components/common/GlassCard';
import { useGPAStore } from './store/useGPAStore';
import { SemesterSection } from './components/calculator/SemesterSection';
import { TargetGPACalculator } from './components/calculator/TargetGPACalculator';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import BottomSheet from './components/common/BottomSheet';
import { SubjectEntryForm } from './components/calculator/SubjectEntryForm';
import FAB from './components/common/FAB';
import BottomNav from './components/common/BottomNav';

type Tab = 'gpa' | 'cgpa' | 'target' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('gpa');
  const [showSettings, setShowSettings] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const { semesters, addSemester, calculateCGPA, gradingScale, setGradingScale } = useGPAStore();

  const tabs = [
    { id: 'gpa', label: 'GPA', icon: Calculator },
    { id: 'cgpa', label: 'CGPA', icon: LayoutDashboard },
    { id: 'target', label: 'Target', icon: TargetIcon },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ] as const;

  const cgpa = calculateCGPA();

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30 font-sans">
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card p-8 border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic tracking-tight">System Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                 <div>
                   <label className="block text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-4">Grading Scale</label>
                   <div className="grid grid-cols-1 gap-3">
                      {(['4.0', '5.0', '10.0'] as const).map((scale) => (
                        <button
                          key={scale}
                          onClick={() => { setGradingScale(scale); setShowSettings(false); }}
                          className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
                            gradingScale === scale 
                              ? 'bg-primary border-primary shadow-lg shadow-primary/20 text-white' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          <span className="font-bold text-lg">{scale} Point Scale</span>
                          {gradingScale === scale && <Check size={20} />}
                        </button>
                      ))}
                   </div>
                 </div>
                 <div className="pt-4 text-xs text-white/20 text-center font-medium">
                   Changes to grading scale will affect all active calculations.
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
             <motion.div 
               initial={{ rotate: -20, scale: 0.8 }}
               animate={{ rotate: 0, scale: 1 }}
               className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
             >
              <GraduationCap size={28} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                GPAfy <span className="text-primary">Elite</span>
              </h1>
              <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase">Advanced Academic Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Scale:</span>
              <span className="text-xs font-black text-primary">{gradingScale}</span>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90"
            >
              <Settings size={20} className="text-white/60" />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-8 space-y-6">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon size={20} className={`transition-colors ${activeTab === tab.id ? 'text-white' : 'group-hover:text-white'}`} />
                  <span className="font-bold text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="sidebar-indicator"
                      className="absolute left-0 w-1 h-6 bg-white rounded-full ml-2"
                    />
                  )}
                </button>
              ))}
            </nav>

            <GlassCard className="primary-gradient p-0 overflow-hidden border-0 shadow-2xl shadow-primary/20">
               <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Cumulative GPA</span>
                    <Trophy size={18} className="text-white/50" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">{cgpa}</span>
                    <span className="text-xs font-bold text-white/50">/ {gradingScale}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase mb-2">
                       <span>Efficiency</span>
                       <span>{((cgpa / Number(gradingScale)) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(cgpa / Number(gradingScale)) * 100}%` }}
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
               </div>
            </GlassCard>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "anticipate" }}
              >
                {activeTab === 'gpa' && (
                  <div className="space-y-8 pb-12">
                    <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h2 className="text-3xl font-black tracking-tight">GPA Calculator</h2>
                        <p className="text-white/40 font-medium">Real-time academic performance tracking.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="glass-button bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-2 h-[48px] px-5 text-sm font-bold">
                          <BookOpen size={18} />
                          <span>Bulk Import</span>
                        </button>
                        <button 
                          onClick={() => addSemester(`Semester ${semesters.length + 1}`)}
                          className="glass-button primary-gradient text-white shadow-lg shadow-primary/30 flex items-center gap-2 h-[48px] px-6 text-sm font-black italic uppercase"
                        >
                          <Plus size={20} />
                          <span>Add Semester</span>
                        </button>
                      </div>
                    </section>

                    <div className="space-y-12">
                      {semesters.map((semester) => (
                        <SemesterSection 
                          key={semester.id} 
                          semesterId={semester.id} 
                          onAddSubject={() => setIsAddingSubject(true)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'analytics' && <AnalyticsDashboard />}
                
                {activeTab === 'target' && <TargetGPACalculator />}

                {/* CGPA / Dashboard View */}
                {activeTab === 'cgpa' && (
                  <div className="space-y-8">
                     <section>
                        <h2 className="text-3xl font-black tracking-tight">Executive Dashboard</h2>
                        <p className="text-white/40 font-medium">High-level overview of your academic standing.</p>
                      </section>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassCard className="p-6 flex flex-col justify-between h-32">
                          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Ranking</div>
                          <div className="text-3xl font-black italic">TOP 5%</div>
                        </GlassCard>
                        <GlassCard className="p-6 flex flex-col justify-between h-32">
                          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Consistency</div>
                          <div className="text-3xl font-black text-green-400">92%</div>
                        </GlassCard>
                        <GlassCard className="p-6 flex flex-col justify-between h-32">
                          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Honor Roll</div>
                          <div className="text-3xl font-black text-primary uppercase">ELITE</div>
                        </GlassCard>
                      </div>
                      <AnalyticsDashboard />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={(tab) => setActiveTab(tab as Tab)} 
          />
        </div>

        {/* Global Floating Action Button - Visible only on GPA tab */}
        {activeTab === 'gpa' && (
          <FAB onClick={() => setIsAddingSubject(true)} />
        )}

        {/* Add Subject Bottom Sheet */}
        <BottomSheet
          isOpen={isAddingSubject}
          onClose={() => setIsAddingSubject(false)}
          title="Add New Subject"
        >
          <SubjectEntryForm 
            onSuccess={() => setIsAddingSubject(false)} 
          />
        </BottomSheet>
      </div>
    </div>
  );
}
