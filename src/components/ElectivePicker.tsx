import { Subject } from '@/types';
import { X, Search, Plus, Filter, Check, Lock } from 'lucide-react';
import { useGpaStore } from '@/store/useGpaStore';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  MASTER_R2021_SUBJECTS, 
  MASTER_R2025_SUBJECTS,
  ALL_OPEN_ELECTIVES,
  ALL_PROFESSIONAL_ELECTIVES,
  ALL_MANDATORY_COURSES
} from '@/data';

export function ElectivePicker({
  isOpen,
  onClose,
  options,
  onSelect,
  title
}: {
  isOpen: boolean;
  onClose: () => void;
  options: Subject[];
  onSelect: (sub: Subject) => void;
  title: string;
}) {
  const { selections, regulation, department } = useGpaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setShowAll(options.length === 0);
    }
  }, [isOpen, options]);

  if (!isOpen) return null;

  const currentDeptSelections = selections[regulation]?.[department] || {};
  const allPickedCodes = Object.values(currentDeptSelections).flatMap(sem => Object.values(sem));

  const masterRegistry = regulation === 'R2021' ? MASTER_R2021_SUBJECTS : 
                         regulation === 'R2025' ? MASTER_R2025_SUBJECTS : {};

  // Determine which consolidated pool to use based on the title or context
  let consolidatedPool: Subject[] = [];
  if (regulation === 'R2021') {
    if (title.toLowerCase().includes('open elective')) {
      consolidatedPool = ALL_OPEN_ELECTIVES;
    } else if (title.toLowerCase().includes('professional elective')) {
      consolidatedPool = ALL_PROFESSIONAL_ELECTIVES.map(s => ({ ...s, type: 'elective_pe' as const }));
    } else if (title.toLowerCase().includes('mandatory')) {
      consolidatedPool = ALL_MANDATORY_COURSES;
    } else if (title.toLowerCase().includes('additional')) {
      consolidatedPool = [
        ...ALL_PROFESSIONAL_ELECTIVES.map(s => ({ ...s, type: 'elective_pe' as const })),
        ...ALL_OPEN_ELECTIVES
      ];
    }
  }

  const baseOptions = showAll ? [...options, ...consolidatedPool] : options;
  
  // De-duplicate options by code
  const uniqueOptionsMap = new Map();
  baseOptions.forEach(opt => uniqueOptionsMap.set(opt.code, opt));
  const uniqueOptions = Array.from(uniqueOptionsMap.values());

  const filteredOptions = uniqueOptions.filter(opt => 
    opt.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exactMatchExists = options.some(opt => opt.code.toLowerCase() === searchQuery.trim().toLowerCase());
  const masterMatch = masterRegistry[searchQuery.trim().toUpperCase()];
  const showCustomOption = searchQuery.trim().length > 0 && !exactMatchExists;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 p-4"
      onClick={onClose}
    >
      <div 
        className="glass-panel bg-[#050505] w-full max-w-xl rounded-[2.5rem] shadow-[0_0_100px_rgba(255,85,0,0.15)] overflow-hidden animate-float transition-weightless flex flex-col max-h-[85vh] border-primary/30 depth-tilt"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-white/5 relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="font-space-grotesque font-medium text-xl text-white tracking-tight flex items-center gap-4 text-glow-orange">
              {title}
            </h3>
            <button 
              onClick={onClose} 
              className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-weightless border border-white/10 active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-3 relative z-10">
            <div className="relative grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Scan for orbital harmonics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-outfit font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-weightless outline-none text-white placeholder:text-white/20"
              />
            </div>
            {consolidatedPool.length > 0 && options.length > 0 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className={cn(
                  "px-5 flex items-center gap-3 rounded-2xl border font-space-grotesque font-black text-[10px] tracking-[0.2em] transition-weightless active:scale-95",
                  showAll 
                    ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(255,85,0,0.4)]" 
                    : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40"
                )}
              >
                <Filter size={14} />
                {showAll ? 'CONSOLIDATED' : 'SUGGESTED'}
              </button>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="overflow-y-auto p-6 grow scrollbar-hide">
          <div className="flex flex-col gap-4">
            {showCustomOption && (
              <button
                onClick={() => { 
                  onSelect({
                    code: searchQuery.trim().toUpperCase(),
                    name: masterMatch?.name || 'Experimental Subject',
                    credits: masterMatch?.credits || 3,
                    type: options[0]?.type || 'elective_pe'
                  });
                  onClose(); 
                }}
                className="w-full text-left glass-panel p-6 rounded-[1.5rem] border-white/10 bg-white/5 hover:bg-primary/5 hover:border-primary transition-weightless group animate-float active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-space-grotesque font-medium text-primary tracking-widest uppercase">
                      {searchQuery.trim().toUpperCase()}
                    </span>
                    <span className="text-[10px] font-space-grotesque font-medium text-white/40 tracking-widest uppercase">
                      • {masterMatch?.credits || 3} CR
                    </span>
                  </div>
                  <Plus className="text-primary group-hover:scale-125 transition-transform" size={18} strokeWidth={3} />
                </div>
                <p className="font-outfit font-medium text-white leading-snug group-hover:text-white">
                  {masterMatch ? masterMatch.name : 'Initialize New Entry'}
                </p>
                <p className="text-[9px] font-space-grotesque font-black text-primary/60 uppercase tracking-[0.2em] mt-2">External Entry Detected</p>
              </button>
            )}

            {filteredOptions.length === 0 && !showCustomOption && (
              <div className="py-24 text-center">
                <p className="text-white/20 font-space-grotesque font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Scanning... no matches</p>
              </div>
            )}

            {filteredOptions.map((opt, idx) => {
               const isAlreadyPicked = allPickedCodes.includes(opt.code);
 
               return (
                 <button 
                   key={opt.code}
                   disabled={isAlreadyPicked}
                   onClick={() => { 
                     onSelect(opt); 
                     onClose(); 
                   }}
                   className={cn(
                     "w-full text-left glass-panel p-6 rounded-[1.5rem] transition-weightless flex items-center justify-between group relative overflow-hidden",
                     isAlreadyPicked 
                       ? "opacity-30 grayscale cursor-not-allowed border-white/5" 
                       : "hover:border-primary hover:bg-primary/5 cursor-pointer active:scale-[0.98] hover:shadow-[0_0_30px_rgba(255,85,0,0.1)]"
                   )}
                   style={{ animationDelay: `${idx * 0.04}s` }}
                 >
                   <div className="flex flex-col gap-2 relative z-10">
                     <div className="flex items-center gap-4">
                       <span className={cn(
                         "text-[10px] font-space-grotesque font-medium tracking-widest uppercase",
                         isAlreadyPicked ? "text-white/20" : "text-primary"
                       )}>
                         {opt.code}
                       </span>
                       <span className="text-[10px] font-space-grotesque font-medium text-white/40 tracking-widest uppercase">
                         • {opt.credits} CR
                       </span>
                     </div>
                     <p className="font-outfit font-medium text-white group-hover:text-white transition-colors tracking-tight">
                       {opt.name}
                     </p>
                   </div>
                   {isAlreadyPicked ? (
                     <Lock size={16} className="text-white/20" />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-weightless shadow-inner">
                       <Check className="opacity-0 group-hover:opacity-100 transition-opacity" size={18} strokeWidth={3} />
                     </div>
                   )}
                 </button>
               );
             })}
           </div>
         </div>
 
         {/* Footer Area */}
         <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center shrink-0">
           <p className="text-[8px] font-space-grotesque font-black text-white/20 uppercase tracking-[0.5em]">GPAfy Engine v2.0</p>
         </div>
       </div>
     </div>
   );
}
