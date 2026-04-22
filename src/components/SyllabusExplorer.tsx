import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGpaStore } from '@/store/useGpaStore';
import { regulationsData, getSubjects } from '@/data';
import { RegulationDropdown } from './RegulationDropdown';
import { DepartmentDropdown } from './DepartmentDropdown';
import { SemesterDropdown } from './SemesterDropdown';
import { Subject } from '@/types';
import { mockSyllabus } from '@/data/mockSyllabus';
import { ChevronLeft } from 'lucide-react';

export function SyllabusExplorer() {
  const { regulation, setRegulation, department, setDepartment } = useGpaStore();
  const [activeSem, setActiveSem] = useState<number>(3); // Default to 3 for CS3351 example
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const REG_LABELS: Record<string, string> = {
    'R2013': 'Admitted 2013–16',
    'R2017': 'Admitted 2017–20',
    'R2021': 'Admitted 2021–24',
    'R2025': 'Admitted 2025 onwards',
  };

  const handleRegChange = (r: string) => {
    setRegulation(r);
    setSelectedSubject(null);
  };
  
  const handleDeptChange = (d: string) => {
    setDepartment(d);
    setSelectedSubject(null);
  };

  const handleSemChange = (s: number) => {
    setActiveSem(s);
    setSelectedSubject(null);
  };

  const depOptions = regulationsData.find(x => x.reg === regulation)?.departments || [];
  const subjects = getSubjects(regulation, department, activeSem);

  return (
    <div className="flex flex-col gap-8 w-full">
      <AnimatePresence mode="wait">
        {!selectedSubject ? (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-8 w-full"
          >
            {/* 1. Pickers */}
            <div className="glass-panel p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative z-[50]">
              <h2 className="text-[10px] font-space-grotesque font-black text-[#059669] uppercase tracking-[0.4em] mb-6">
                Syllabus Explorer
              </h2>
              
              <div className="flex flex-col gap-6">
                <RegulationDropdown 
                  value={regulation} 
                  options={regulationsData.map(r => ({ reg: r.reg, label: REG_LABELS[r.reg] }))} 
                  onChange={handleRegChange}
                />
                
                <AnimatePresence>
                  {depOptions.length > 0 && (
                    <motion.div 
                      key="dept"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative z-[45]"
                    >
                      <DepartmentDropdown 
                        value={department} 
                        options={depOptions.map(d => d.dept)} 
                        onChange={handleDeptChange} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {depOptions.length > 0 && department && (
                    <motion.div 
                      key="sem"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative z-[40]"
                    >
                      <SemesterDropdown value={activeSem} onChange={handleSemChange} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 2. Subject List */}
            {department && activeSem && subjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 w-full">
                {subjects.map((sub: Subject) => (
                  <button 
                    key={sub.code} 
                    onClick={() => setSelectedSubject(sub)}
                    className="glass-panel p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-left hover:border-[#059669]/30 hover:shadow-[0_12px_40px_rgba(5,150,105,0.06)] bg-white/60 transition-all duration-300 group active:scale-[0.98] flex flex-col gap-4"
                  >
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 bg-[#059669]/10 text-[#059669] rounded-lg text-[10px] font-black uppercase tracking-widest font-space-grotesque group-hover:bg-[#059669] group-hover:text-white transition-colors">
                           {sub.code}
                         </span>
                         <span className="px-3 py-1 bg-gray-100/80 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest font-space-grotesque">
                           {sub.credits} CR
                         </span>
                      </div>
                      <h3 className="font-outfit font-black text-gray-800 text-lg leading-tight group-hover:text-[#059669] transition-colors">{sub.name}</h3>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="syllabus"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="flex flex-col gap-6 w-full z-10 relative"
          >
            <button 
               onClick={() => setSelectedSubject(null)}
               className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-space-grotesque font-bold uppercase tracking-widest text-[10px] self-start bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-full transition-all duration-300 active:scale-95"
            >
               <ChevronLeft size={16} strokeWidth={2.5} /> Back to Subject List
            </button>

            <div className="glass-panel p-6 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] bg-white/40 overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-white border w-full">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(5,150,105,0.08)_0%,transparent_70%)] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10 w-full">
                <span className="px-3 py-1 bg-[#059669]/10 text-[#059669] rounded-full text-[10px] font-black uppercase tracking-widest font-space-grotesque">
                  {selectedSubject.code}
                </span>
                <span className="px-3 py-1 bg-gray-100/80 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest font-space-grotesque">
                  {selectedSubject.credits} Credits
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-space-grotesque font-black text-gray-900 mb-10 tracking-tight leading-tight relative z-10 w-full">
                {selectedSubject.name}
              </h1>

              <SyllabusContent subjectToken={selectedSubject.code} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SyllabusContent({ subjectToken }: { subjectToken: string }) {
  const data = mockSyllabus[subjectToken];

  if (!data) {
    return (
      <div className="p-8 border-2 border-dashed border-[#059669]/20 rounded-3xl bg-[#059669]/5 flex items-center justify-center text-[#059669]/80 font-space-grotesque font-bold uppercase tracking-widest text-[10px] shadow-sm">
        Syllabus data pending upload
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 relative z-10">
      <p className="text-gray-600 font-medium leading-relaxed bg-white/50 p-6 rounded-3xl border border-emerald-50/50 shadow-sm">
        {data.description}
      </p>

      <div className="relative pl-8 md:pl-12 space-y-10 before:absolute before:inset-0 before:left-[19px] md:before:left-[27px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#059669] before:via-[#059669]/40 before:to-transparent">
        {data.units.map((unit: { title: string; topics: string[] }, idx: number) => (
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.1 }}
            key={idx} 
            className="relative bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-50 hover:border-emerald-200 hover:shadow-[0_12px_40px_rgba(5,150,105,0.08)] transition-all duration-300 group"
          >
            {/* Timeline Dot */}
            <div className="absolute left-[-2rem] md:left-[-3rem] top-8 w-6 h-6 bg-white border-4 border-[#059669]/80 rounded-full group-hover:scale-125 group-hover:border-[#059669] transition-transform duration-300 z-10 shadow-sm" />
            
            <h3 className="font-space-grotesque font-bold text-lg md:text-xl text-gray-900 mb-6 tracking-tight flex items-center gap-3">
              <span className="text-[#059669]/20 text-4xl md:text-5xl font-black tabular-nums tracking-tighter drop-shadow-sm group-hover:text-[#059669]/40 transition-colors">0{idx + 1}</span>
              <span className="group-hover:text-[#059669] transition-colors">{unit.title.split(':').pop()?.trim() || unit.title}</span>
            </h3>

            <p className="text-gray-700 leading-[1.8] text-[15px] font-medium tracking-tight pr-4">
              {unit.topics.join(' — ')}.
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
