"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { regulationsData, getSubjects } from '@/data';
import { Subject } from '@/types';
import { useGpaStore } from '@/store/useGpaStore';
import { SemesterSection } from '@/components/SemesterSection';
import { CgpaChart } from '@/components/CgpaChart';
import { calculateSGPA } from '@/lib/gpa';
import { StickyResultBar } from '@/components/StickyResultBar';
import { SemesterDropdown } from '@/components/SemesterDropdown';
import { DepartmentDropdown } from '@/components/DepartmentDropdown';
import { RegulationDropdown } from '@/components/RegulationDropdown';
import { ManualCgpaTable } from '@/components/ManualCgpaTable';
import { WelcomeDashboard } from '@/components/WelcomeDashboard';
import { SyllabusExplorer } from '@/components/SyllabusExplorer';
import { ArrowLeft } from 'lucide-react';

const REG_LABELS: Record<string, string> = {
  'R2013': 'Admitted 2013–16',
  'R2017': 'Admitted 2017–20',
  'R2021': 'Admitted 2021–24',
  'R2025': 'Admitted 2025 onwards',
};

function CalculatorContent({ mode, onBack }: { mode: 'sgpa' | 'cgpa', onBack: () => void }) {
  const { 
    regulation, setRegulation, department, setDepartment, getGrade, selections, 
    extraSubjects, manualSemData, cgpaSemesterCount, subjectCounts, getSelection, 
    getMasterSubjects, getElectivePools 
  } = useGpaStore();

  const [activeSem, setActiveSem] = useState<number>(1);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsCalculated(false);
  }, [mode]);

  const handleRegChange = (r: string) => {
    setRegulation(r);
  };

  const depOptions = regulationsData.find(x => x.reg === regulation)?.departments || [];
  
  const chartData = [1,2,3,4,5,6,7,8].map(s => {
      if (mode === 'cgpa') {
        const data = manualSemData[regulation]?.[department]?.[s] || { gpa: '', credits: '' };
        const sgpa = parseFloat(data.sgpa) || 0;
        const totalCredits = parseInt(data.credits) || 0;
        const semCount = cgpaSemesterCount[regulation]?.[department] || 1;
        const isRelevant = s <= semCount;
        return { 
          sem: s, 
          sgpa: isRelevant ? sgpa : 0, 
          cgpa: 0, 
          totalCredits: isRelevant ? totalCredits : 0 
        };
      }

      const currentSubjectCount = subjectCounts[regulation]?.[department]?.[s] || 0;
      
      const manualSlots = Array.from({ length: currentSubjectCount }, (_, i) => {
        const slotCode = `SLOT_${s}_${i + 1}`;
        const selectedCode = getSelection(s, slotCode);
        
        if (selectedCode) {
          const allSubjects = [
            ...getMasterSubjects(regulation),
            ...getElectivePools(regulation)
          ];
          const found = allSubjects.find(sub => sub.code === selectedCode);
          if (found) return { ...found, slotCode } as Subject;
        }

        return {
          code: slotCode,
          name: `Subject ${i + 1}`,
          credits: 3,
          type: 'theory',
          isPlaceholder: true,
          options: []
        } as Subject;
      });

      const subs = getSubjects(regulation, department, s);
      const extraList = extraSubjects[regulation]?.[department]?.[s] || [];
      const combined = [...(currentSubjectCount > 0 ? manualSlots : subs), ...extraList];

      const semInputs = combined.map(sub => {
         if (sub.options) {
            const pickedCode = selections[regulation]?.[department]?.[s]?.[sub.code];
            const pickedSubject = pickedCode ? sub.options.find((opt: Subject) => opt.code === pickedCode) : null;
            return {
              credits: pickedSubject ? pickedSubject.credits : sub.credits,
              type: pickedSubject ? pickedSubject.type : sub.type,
              grade: pickedCode ? getGrade(s, pickedCode) : ''
            };
         }
         const gradeKey = sub.slotCode || sub.code;
         return {
            credits: sub.credits, type: sub.type, grade: getGrade(s, gradeKey)
         };
      });
      const sgpa = calculateSGPA(semInputs);
      return { sem: s, sgpa, cgpa: 0, totalCredits: semInputs.reduce((sum, i) => i.grade ? sum + i.credits : sum, 0) };
  });

  let runningCredits = 0;
  let runningPoints = 0;
  chartData.forEach(cd => {
     if (cd.sgpa > 0) {
        runningCredits += cd.totalCredits;
        runningPoints += cd.sgpa * cd.totalCredits;
        cd.cgpa = runningPoints / runningCredits;
     }
  });

  const finalCgpa = runningCredits > 0 ? (runningPoints / runningCredits).toFixed(2) : '0.00';
  const activeSgpa = chartData.find(c => c.sem === activeSem)?.sgpa || 0;

  return (
    <div className="flex flex-col gap-10">
      <motion.button 
        whileHover={{ x: -4 }}
        onClick={onBack}
        className="flex items-center gap-2 text-primary font-space-grotesque font-bold uppercase tracking-widest text-[10px] self-start bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <motion.section 
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel p-8 rounded-[2.5rem] depth-tilt relative z-[45]"
      >
        <h2 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-6 text-glow-orange">
          Regulation Phase
        </h2>
        <div className="relative">
          <RegulationDropdown 
            value={regulation} 
            options={regulationsData.map(r => ({ reg: r.reg, label: REG_LABELS[r.reg] }))} 
            onChange={handleRegChange}
          />
        </div>
      </motion.section>

      <AnimatePresence>
        {depOptions.length > 0 && (
          <motion.section 
            layout
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel p-8 rounded-[2.5rem] depth-tilt relative z-[40]"
          >
            <h2 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-6 text-glow-orange">
              Department
            </h2>
            <div className="relative">
              <DepartmentDropdown 
                value={department} 
                options={depOptions.map(d => d.dept)} 
                onChange={(dept) => setDepartment(dept)} 
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mode === 'sgpa' && depOptions.length > 0 && department && (
          <motion.section 
            layout
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="glass-panel p-8 rounded-[2.5rem] depth-tilt relative z-[30]"
          >
            <h2 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-6 text-glow-orange">
              Semester Selection
            </h2>
            <div className="relative z-50">
              <SemesterDropdown value={activeSem} onChange={setActiveSem} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
         <h2 className="text-[10px] font-space-grotesque font-black text-gray-400 uppercase tracking-[0.4em] mb-8 px-8">
            {mode === 'cgpa' ? 'Cumulative Data Input' : `Semester ${activeSem} Data Entry`}
         </h2>
         
         <div className="flex flex-col gap-6">
           <AnimatePresence mode="popLayout">
             {mode === 'cgpa' ? (
                <ManualCgpaTable />
             ) : (
               <motion.div
                 key={`standalone-${activeSem}`}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
               >
                 <SemesterSection 
                   semNumber={activeSem}
                   isOpen={true}
                   showSgpa={isCalculated}
                   onToggle={() => {}}
                   variant="standalone"
                 />
               </motion.div>
             )}
           </AnimatePresence>
         </div>

      </motion.section>

      {!isCalculated && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="mt-8 px-4 flex flex-col items-center"
         >
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                 setIsCalculated(true);
                 setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
              }}
              className="w-full max-w-sm font-space-grotesque font-black text-xl py-6 rounded-[2.5rem] text-white solar-glow relative overflow-hidden transition-weightless group"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #059669 100%)",
                backgroundSize: "200% auto"
              }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out" />
              <span className="relative z-10 tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500">GENERATE SCORE</span>
            </motion.button>
            <p className="text-[9px] font-space-grotesque text-white/40 mt-8 font-black uppercase tracking-[0.5em] text-center opacity-70">
              GPAfy computation active
            </p>
         </motion.div>
      )}

      <AnimatePresence>
        {isCalculated && (
          <motion.section 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="mt-12"
          >
             <h2 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-8 px-8 text-glow-orange">
                Final result
             </h2>
             
             {mode === 'cgpa' ? (
               <div className="flex flex-col gap-10">
                 <div className="glass-panel rounded-[3rem] p-10 text-gray-900 shadow-[0_8px_30px_rgba(255,85,0,0.05)] flex flex-col items-center gap-10 relative overflow-hidden border-primary/10">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(5,150,105,0.08)_0%,transparent_70%)] -translate-y-1/2 translate-x-1/2" />
                   <div className="text-center z-10">
                     <p className="text-primary font-space-grotesque font-black text-xs tracking-[0.4em] uppercase mb-4">Cumulative Score</p>
                     <motion.h1 
                       initial={{ scale: 0.5, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                       className="text-7xl sm:text-9xl font-space-grotesque font-black tracking-tighter leading-none text-gray-900"
                     >
                       {finalCgpa}
                     </motion.h1>
                   </div>
                 </div>
                 <div className="glass-panel p-8 rounded-[3rem] depth-tilt">
                   <CgpaChart data={chartData} />
                 </div>
               </div>
             ) : (
               <div className="glass-panel rounded-[3rem] p-10 text-gray-900 shadow-[0_8px_30px_rgba(255,85,0,0.05)] flex flex-col items-center gap-10 relative overflow-hidden border-primary/10">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(5,150,105,0.08)_0%,transparent_70%)] -translate-y-1/2 translate-x-1/2" />
                 <div className="text-center z-10">
                   <p className="text-primary font-space-grotesque font-black text-xs tracking-[0.4em] uppercase mb-4">Semester {activeSem} GPA</p>
                   <motion.h1 
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                     className="text-7xl sm:text-9xl font-space-grotesque font-black tracking-tighter leading-none text-gray-900"
                   >
                     {activeSgpa.toFixed(2)}
                   </motion.h1>
                 </div>
               </div>
             )}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCalculated && (
          <StickyResultBar sgpa={mode === 'sgpa' ? activeSgpa : parseFloat(finalCgpa)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MainApp() {
  const [activeTool, setActiveTool] = useState<'dashboard' | 'sgpa' | 'cgpa' | 'syllabus'>('dashboard');
  const resetAll = useGpaStore(state => state.resetAll);

  const handleBackToDashboard = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    resetAll();
    setActiveTool('dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 relative mt-12 md:mt-16">
      <AnimatePresence mode="wait">
        {activeTool === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
            <WelcomeDashboard onSelect={setActiveTool} />
          </motion.div>
        )}
        
        {(activeTool === 'sgpa' || activeTool === 'cgpa') && (
          <motion.div key="calculator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CalculatorContent mode={activeTool} onBack={handleBackToDashboard} />
          </motion.div>
        )}

        {activeTool === 'syllabus' && (
          <motion.div key="syllabus" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <motion.button 
              whileHover={{ x: -4 }}
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-primary font-space-grotesque font-bold uppercase tracking-widest text-[10px] self-start bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </motion.button>
            <SyllabusExplorer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400 font-space-grotesque tracking-widest animate-pulse">Initializing stellar systems...</div>}>
      <MainApp />
    </Suspense>
  )
}
