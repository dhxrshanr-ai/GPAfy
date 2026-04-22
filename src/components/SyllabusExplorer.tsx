import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGpaStore } from '@/store/useGpaStore';
import { regulationsData, getSubjects } from '@/data';
import { RegulationDropdown } from './RegulationDropdown';
import { DepartmentDropdown } from './DepartmentDropdown';
import { SemesterDropdown } from './SemesterDropdown';
import { Subject } from '@/types';
import { mockSyllabus } from '@/data/mockSyllabus';
import { ElectivePicker } from './ElectivePicker';
import { Plus, BookOpen, ChevronRight } from 'lucide-react';

export function SyllabusExplorer() {
  const { regulation, setRegulation, department, setDepartment } = useGpaStore();
  const [activeSem, setActiveSem] = useState<number>(3); // Default to 3 for CS3351 example
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
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
    <div className="flex flex-col gap-8">
      {/* 1. Pickers */}
      <div className="glass-panel p-8 rounded-[2.5rem] depth-tilt relative z-[50]">
        <h2 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-6 text-glow-orange">
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

      {/* 2. Subject Picker Trigger */}
      <AnimatePresence>
        {department && activeSem && subjects.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 relative z-[40]"
          >
             <h2 className="text-[10px] font-space-grotesque font-black text-gray-400 uppercase tracking-[0.4em] ml-8 mb-2">
                Subject
             </h2>
             
             {selectedSubject ? (
               <div
                 onClick={() => setIsPickerOpen(true)}
                 className="glass-panel p-6 rounded-[1.5rem] flex items-center justify-between border border-primary/20 bg-emerald-50 cursor-pointer hover:border-primary transition-colors group active:scale-[0.98]"
               >
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                     <BookOpen size={22} strokeWidth={3} />
                   </div>
                   <div>
                     <p className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.3em]">Viewing Syllabus</p>
                     <p className="text-sm font-outfit font-medium text-gray-800 tracking-tight">{selectedSubject.name}</p>
                   </div>
                 </div>
                 <ChevronRight size={20} className="text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
               </div>
             ) : (
               <div
                 onClick={() => setIsPickerOpen(true)}
                 className="glass-panel p-6 rounded-[1.5rem] flex items-center justify-between border-dashed border-primary/40 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 hover:border-primary transition-colors group active:scale-[0.98]"
               >
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Plus size={22} strokeWidth={3} />
                   </div>
                   <div>
                     <p className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.3em]">Explore Syllabus</p>
                     <p className="text-sm font-outfit font-medium text-gray-500 group-hover:text-gray-800 transition-colors tracking-tight">Tap to Select Subject</p>
                   </div>
                 </div>
                 <ChevronRight size={20} className="text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
               </div>
             )}

             <ElectivePicker 
               isOpen={isPickerOpen}
               onClose={() => setIsPickerOpen(false)}
               options={subjects}
               onSelect={(sub) => {
                 setSelectedSubject(sub);
               }}
               title="Select Subject"
             />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Syllabus View */}
      <AnimatePresence mode="popLayout">
        {selectedSubject && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="glass-panel p-8 md:p-12 rounded-[3rem] depth-tilt bg-white/40 mt-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest font-space-grotesque">
                {selectedSubject.code}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-[10px] font-black uppercase tracking-widest font-space-grotesque">
                {selectedSubject.credits} Credits
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-space-grotesque font-black text-gray-900 mb-8 tracking-tight">
              {selectedSubject.name}
            </h1>

            <SyllabusContent subjectToken={selectedSubject.code} />

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SyllabusContent({ subjectToken }: { subjectToken: string }) {
  const data = mockSyllabus[subjectToken];

  if (!data) return null;

  return (
    <div className="flex flex-col gap-10 relative z-10">
      <p className="text-gray-600 font-medium leading-relaxed bg-white/50 p-6 rounded-3xl border border-emerald-50/50 shadow-sm">
        {data.description}
      </p>

      <div className="relative pl-8 md:pl-12 space-y-10 before:absolute before:inset-0 before:left-[19px] md:before:left-[27px] before:h-full before:w-[2px] before:bg-gradient-to-b before:from-emerald-400 before:via-emerald-200 before:to-transparent">
        {data.units.map((unit, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.1 }}
            key={idx} 
            className="relative bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-50/50 hover:border-emerald-200 hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)] transition-all duration-300 group"
          >
            {/* Timeline Dot */}
            <div className="absolute left-[-2rem] md:left-[-3rem] top-8 w-6 h-6 bg-white border-4 border-emerald-400 rounded-full group-hover:scale-125 group-hover:border-primary transition-transform duration-300 z-10 shadow-sm" />
            
            <h3 className="font-space-grotesque font-bold text-lg md:text-xl text-gray-900 mb-6 tracking-tight flex items-center gap-3">
              <span className="text-emerald-100 text-4xl md:text-5xl font-black tabular-nums tracking-tighter drop-shadow-sm group-hover:text-emerald-200 transition-colors">0{idx + 1}</span>
              <span className="group-hover:text-primary transition-colors">{unit.title.split(':').pop()?.trim() || unit.title}</span>
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
