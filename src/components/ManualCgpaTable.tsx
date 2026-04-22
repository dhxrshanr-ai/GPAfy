import { motion, AnimatePresence } from 'framer-motion';
import { useGpaStore } from '@/store/useGpaStore';
import { Landmark, Star, Info } from 'lucide-react';
import { ManualCgpaSemesterDropdown } from './ManualCgpaSemesterDropdown';

export function ManualCgpaTable() {
  const { 
    regulation, 
    department, 
    manualSemData, 
    setManualSemData, 
    cgpaSemesterCount, 
    setCgpaSemesterCount 
  } = useGpaStore();

  const count = cgpaSemesterCount[regulation]?.[department] || 1;

  const handleDataChange = (sem: number, field: 'sgpa' | 'credits', value: string) => {
    const current = manualSemData[regulation]?.[department]?.[sem] || { sgpa: '', credits: '' };
    setManualSemData(sem, { ...current, [field]: value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 relative z-10"
    >
      {/* Semester Count Selection */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] transition-weightless border-primary/10 relative z-[100]">
        <h2 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
          <Landmark size={14} /> Scope of Calculation
        </h2>
        
        <ManualCgpaSemesterDropdown 
          value={count} 
          onChange={setCgpaSemesterCount} 
        />

        <p className="text-[9px] font-space-grotesque font-black text-gray-400 uppercase tracking-[0.2em] mt-6 ml-2 italic">
          Select the semester till which you need to check your CGPA
        </p>
      </div>

      {/* Manual Entry Table */}
      <div className="glass-panel rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-primary/10 bg-white/60 backdrop-blur-3xl shadow-lg relative z-0">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 p-4 sm:p-6 flex items-center text-white rounded-t-[2rem] sm:rounded-t-[2.5rem]">
          <div className="w-12 text-center font-space-grotesque font-black text-[10px] uppercase tracking-widest opacity-80">Sem</div>
          <div className="flex-1 text-center font-space-grotesque font-black text-[10px] uppercase tracking-widest opacity-80 pl-4">GPA (e.g. 8.50)</div>
          <div className="flex-1 text-center font-space-grotesque font-black text-[10px] uppercase tracking-widest opacity-80 pr-4 flex items-center justify-center gap-2">
            Credits Earned <Info size={12} className="opacity-50" />
          </div>
        </div>

        {/* Table Body */}
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {Array.from({ length: count }, (_, i) => i + 1).map((sem, i) => {
              const data = manualSemData[regulation]?.[department]?.[sem] || { sgpa: '', credits: '' };
              return (
                <motion.div
                  key={sem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-emerald-50/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-space-grotesque font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    {sem}
                  </div>
                  
                  <div className="flex-1 px-2">
                    <input 
                      type="text"
                      placeholder="8.00"
                      value={data.sgpa}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        if (val.split('.').length <= 2) handleDataChange(sem, 'sgpa', val);
                      }}
                      className="w-full bg-transparent border-b-2 border-gray-200 py-2 px-1 font-space-grotesque font-black text-xl sm:text-2xl text-gray-900 placeholder:text-gray-200 focus:border-primary/50 outline-none text-center transition-all duration-300"
                    />
                  </div>

                  <div className="flex-1 px-2">
                    <input 
                      type="text"
                      placeholder="22"
                      value={data.credits}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        handleDataChange(sem, 'credits', val);
                      }}
                      className="w-full bg-transparent border-b-2 border-gray-200 py-2 px-1 font-space-grotesque font-black text-xl sm:text-2xl text-gray-900 placeholder:text-gray-200 focus:border-primary/50 outline-none text-center transition-all duration-300"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <Star className="text-primary mt-1 shrink-0" size={18} />
                <p className="text-[11px] font-space-grotesque font-bold text-gray-500 leading-relaxed uppercase tracking-wider">
                    Pro-tip: You can use the <span className="text-primary">GPA Calculator</span> from the Dashboard to calculate individual semester GPAs if you don&apos;t know them yet.
                </p>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
