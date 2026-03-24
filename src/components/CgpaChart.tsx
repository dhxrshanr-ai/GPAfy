import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChartData {
  sem: number;
  sgpa: number;
  cgpa: number;
}

export function CgpaChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) return null;

  const validSgpas = data.filter(d => d.sgpa > 0).map(d => d.sgpa);
  const maxSgpa = Math.max(...validSgpas, 10);
  const bestSgpa = Math.max(...validSgpas);
  const lowestSgpa = Math.min(...validSgpas);

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(255,85,0,0.06)] mb-8 transition-shadow animate-float depth-tilt border-primary/10">
      <h3 className="text-[10px] font-space-grotesque font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
         <span className="w-6 h-px bg-primary/30" /> Statistics
      </h3>
      <div className="flex items-end justify-between h-52 gap-4 mt-6">
        {data.map((d) => {
          const heightPct = d.sgpa > 0 ? (d.sgpa / maxSgpa) * 100 : 0;
          const isBest = d.sgpa === bestSgpa && d.sgpa > 0;
          const isLowest = d.sgpa === lowestSgpa && d.sgpa > 0 && validSgpas.length > 1;

          return (
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              key={d.sem} 
              className="flex flex-col items-center flex-1 group relative"
            >
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-space-grotesque font-black text-gray-800 bg-white backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-top-14 z-20">
                 {d.sgpa > 0 ? d.sgpa.toFixed(2) : '-'}
               </div>
               <div className="w-full max-w-[40px] h-full bg-gray-100 rounded-2xl relative flex items-end justify-center overflow-hidden border border-gray-200 shadow-inner">
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${heightPct}%` }}
                   transition={{ duration: 1, type: "spring", stiffness: 50 }}
                   className={cn(
                     "w-full rounded-2xl",
                     isBest ? "bg-primary shadow-[0_0_15px_rgba(255,85,0,0.3)]" : isLowest ? "bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-gray-400/60 shadow-none"
                   )}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
               </div>
               <span className="text-[11px] font-space-grotesque font-black text-gray-700 mt-4">S{d.sem}</span>
               <span className="text-[9px] font-outfit font-black text-gray-400 mt-1">{d.cgpa > 0 ? d.cgpa.toFixed(2) : '-'}</span>
            </motion.div>
          )
        })}
      </div>
      <div className="flex items-center gap-6 mt-8 justify-center border-t border-gray-200 pt-8">
        <div className="flex items-center gap-2.5 text-[10px] font-space-grotesque font-black text-gray-500 uppercase tracking-[0.2em]"><div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(255,85,0,0.4)]" /> Peak</div>
        <div className="flex items-center gap-2.5 text-[10px] font-space-grotesque font-black text-gray-500 uppercase tracking-[0.2em]"><div className="w-3 h-3 rounded-full bg-gray-400/60" /> GPA</div>
        <div className="flex items-center gap-2.5 text-[10px] font-space-grotesque font-black text-gray-500 uppercase tracking-[0.2em]"><div className="w-3 h-3 rounded-full bg-rose-400" /> Nadir</div>
      </div>
    </div>
  )
}
