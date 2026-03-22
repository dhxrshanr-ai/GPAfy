"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ModeDropdown } from '@/components/ModeDropdown';
import { ManualCgpaTable } from '@/components/ManualCgpaTable';

const REG_LABELS: Record<string, string> = {
  'R2013': 'Admitted 2013–16',
  'R2017': 'Admitted 2017–20',
  'R2021': 'Admitted 2021–24',
  'R2025': 'Admitted 2025 onwards',
};

function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryReg = searchParams.get('reg');
  const queryDept = searchParams.get('dept');
  const queryMode = searchParams.get('mode');

  const { 
    regulation, setRegulation, department, setDepartment, getGrade, selections, 
    extraSubjects, manualSemData, cgpaSemesterCount, subjectCounts, getSelection, 
    getMasterSubjects, getElectivePools 
  } = useGpaStore();

  const [mode, setMode] = useState<'sgpa' | 'cgpa'>((queryMode as 'sgpa' | 'cgpa') || 'cgpa');
  const [activeSem, setActiveSem] = useState<number>(1);
  const [isCalculated, setIsCalculated] = useState(false);

  // Fresh start on mount (page refresh)
  useEffect(() => {
    window.scrollTo(0, 0);
    // If there ARE params, clear them to force "start from first section"
    if (queryReg || queryDept || queryMode) {
      router.replace('/');
    }
    // and hidden results
    setIsCalculated(false);
  }, [queryReg, queryDept, queryMode, router]); // Dependency array for lint

  // Sync state ONLY when user explicitly changes things (already handled by handleRegChange etc)
  // We remove the auto-sync-from-URL-on-mount to ensure a fresh start on every refresh

  const updateUrl = (r: string, d: string, m: string) => {
    router.replace(`/?reg=${r}&dept=${d}&mode=${m}`);
  };

  const handleRegChange = (r: string) => {
    setRegulation(r);
    updateUrl(r, department, mode);
  };
  
  const handleModeChange = (m: 'sgpa' | 'cgpa') => {
    setMode(m);
    updateUrl(regulation, department, m);
  };

  const depOptions = regulationsData.find(x => x.reg === regulation)?.departments || [];
  
  // Calculate Global CGPA Graph Data
  const chartData = [1,2,3,4,5,6,7,8].map(s => {
      if (mode === 'cgpa') {
        const data = manualSemData[regulation]?.[department]?.[s] || { sgpa: '', credits: '' };
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
         return {
            credits: sub.credits, type: sub.type, grade: getGrade(s, sub.code)
         };
      });
      const sgpa = calculateSGPA(semInputs);
      return { sem: s, sgpa, cgpa: 0, totalCredits: semInputs.reduce((sum, i) => i.grade ? sum + i.credits : sum, 0) };
  });

  // Calculate cascading CGPA
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
    <div className="flex flex-col gap-10 max-w-2xl mx-auto pb-24 px-4 relative">
      
      {/* 1. Regulation Picker */}
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

      {/* 2. Department Picker */}
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
                onChange={(dept) => { setDepartment(dept); updateUrl(regulation, dept, mode); }} 
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 3. Mode Toggle */}
      <motion.section 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-panel p-8 rounded-[2.5rem] depth-tilt relative z-[35]"
      >
        <h2 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-6 text-glow-orange">
          Calculation mode
        </h2>
        <div className="relative">
          <ModeDropdown 
            value={mode} 
            onChange={handleModeChange}
          />
        </div>
      </motion.section>

      {/* 4. Semester Picker (Only for SGPA) */}
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

      {/* 5. Subject Entry Accordions */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
         <h2 className="text-[10px] font-space-grotesque font-black text-white/60 uppercase tracking-[0.4em] mb-8 px-8 text-glow-white">
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

      {/* 5. Calculate Button */}
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
                background: "linear-gradient(135deg, #FF5500 0%, #FF8C00 50%, #FF5500 100%)",
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

      {/* 6. Results Panel */}
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
                 <div className="glass-panel rounded-[3rem] p-10 text-white shadow-[0_0_50px_rgba(255,85,0,0.15)] flex flex-col items-center gap-10 relative overflow-hidden border-primary/30 depth-tilt">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                   <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
                   <div className="text-center z-10">
                     <p className="text-primary font-space-grotesque font-black text-xs tracking-[0.4em] uppercase mb-4 text-glow-orange">Cumulative Score</p>
                     <motion.h1 
                       initial={{ scale: 0.5, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                       className="text-7xl sm:text-9xl font-space-grotesque font-black tracking-tighter leading-none text-glow-white"
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
               <div className="glass-panel rounded-[3rem] p-10 text-white shadow-[0_0_50px_rgba(255,85,0,0.15)] flex flex-col items-center gap-10 relative overflow-hidden border-primary/30 depth-tilt">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                 <div className="text-center z-10">
                   <p className="text-primary font-space-grotesque font-black text-xs tracking-[0.4em] uppercase mb-4 text-glow-orange">Semester {activeSem} GPA</p>
                   <motion.h1 
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                     className="text-7xl sm:text-9xl font-space-grotesque font-black tracking-tighter leading-none text-glow-white"
                   >
                     {activeSgpa.toFixed(2)}
                   </motion.h1>
                 </div>
               </div>
             )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Sticky bar for mobile showing active SGPA in single mode, or overall CGPA context */}
      <AnimatePresence>
        {isCalculated && (
          <StickyResultBar sgpa={mode === 'sgpa' ? activeSgpa : parseFloat(finalCgpa)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white/40 font-space-grotesque tracking-widest animate-pulse">Initializing stellar systems...</div>}>
      <CalculatorContent />
    </Suspense>
  )
}
