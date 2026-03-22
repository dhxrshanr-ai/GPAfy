import { Subject } from '@/types';
import { X, Search, Plus, Check } from 'lucide-react';
import { useGpaStore } from '@/store/useGpaStore';
import { useState, useEffect } from 'react';
import { 
  MASTER_R2021_SUBJECTS, 
  MASTER_R2025_SUBJECTS
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
  const { regulation } = useGpaStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const masterRegistry = regulation === 'R2021' ? MASTER_R2021_SUBJECTS : 
                         regulation === 'R2025' ? MASTER_R2025_SUBJECTS : {};

  const masterMatch = masterRegistry[searchQuery.trim().toUpperCase()];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 p-6 sm:p-20"
      onClick={onClose}
    >
      <div 
        className="glass-panel bg-[#050505] w-full max-w-lg rounded-[2rem] shadow-[0_0_100px_rgba(255,85,0,0.15)] overflow-hidden animate-float transition-weightless flex flex-col max-h-[80vh] border-primary/30 depth-tilt"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-white/5 relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-space-grotesque font-medium text-lg text-white tracking-tight text-glow-orange">
              {title}
            </h3>
            <button 
              onClick={onClose} 
              className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-weightless border border-white/10 active:scale-90"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative z-10 group">
             <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <Search className="text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
             </div>
             <input 
               type="text" 
               placeholder="ENTER CODE (e.g. AI3201)" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               autoFocus
               className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-base font-outfit font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-white placeholder:text-white/10 tracking-widest uppercase"
             />
             {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={14} className="text-white/40" />
                </button>
             )}
          </div>
        </div>

        {/* Dynamic Fetch Area */}
        <div className="overflow-y-auto p-6 grow scrollbar-hide space-y-6">
            
            {/* Direct Match Result */}
            {searchQuery.trim().length >= 3 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-[9px] font-space-grotesque font-black text-primary/40 uppercase tracking-[0.4em] mb-3 ml-1">Terminal Resolve</p>
                    {masterMatch ? (
                        <button
                          onClick={() => { onSelect({ ...masterMatch, type: 'theory' } as Subject); onClose(); }}
                          className="w-full text-left glass-panel p-6 rounded-[1.5rem] border-primary bg-primary/10 hover:bg-primary/20 transition-all group shadow-[0_0_30px_rgba(255,85,0,0.1)] ring-1 ring-primary/20"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-space-grotesque font-bold rounded-md tracking-widest">
                                        {masterMatch.code}
                                    </span>
                                    <span className="text-[10px] font-space-grotesque font-medium text-white/40 tracking-widest uppercase">
                                        • {masterMatch.credits} CR
                                    </span>
                                </div>
                                <Check size={20} className="text-primary animate-pulse" />
                            </div>
                            <h4 className="text-lg font-outfit font-bold text-white leading-tight mb-2 uppercase tracking-tight">
                                {masterMatch.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[9px] font-space-grotesque font-black text-primary uppercase tracking-widest">
                                <Plus size={12} /> ADD SUBJECT
                            </div>
                        </button>
                    ) : (
                        <div className="glass-panel p-6 rounded-[1.5rem] border-white/5 bg-white/[0.02] text-center border-dashed border-2">
                             <p className="text-white/20 font-space-grotesque font-bold text-xs tracking-widest uppercase py-4">
                                {searchQuery.trim().length < 5 ? "Analyzing..." : "Not Found"}
                             </p>
                             {searchQuery.trim().length >= 6 && (
                                <button 
                                  onClick={() => {
                                      onSelect({
                                          code: searchQuery.trim().toUpperCase(),
                                          name: "Experimental Subject",
                                          credits: 3,
                                          type: 'theory'
                                      } as Subject);
                                      onClose();
                                  }}
                                  className="mt-4 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-space-grotesque font-black text-white hover:bg-primary hover:border-primary transition-all uppercase tracking-widest"
                                >
                                    Force Generate
                                </button>
                             )}
                        </div>
                    )}
                </div>
            )}

            {/* Suggested Options */}
            {options.length > 0 && !masterMatch && (
                <div className="animate-in fade-in duration-700 delay-300">
                    <p className="text-[10px] font-space-grotesque font-black text-white/20 uppercase tracking-[0.4em] mb-4 ml-2">Suggested Orbits</p>
                    <div className="grid grid-cols-1 gap-4">
                        {options.map((opt) => (
                           <button
                             key={opt.code}
                             onClick={() => { onSelect(opt); onClose(); }}
                             className="w-full text-left p-6 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                           >
                               <div>
                                   <div className="flex items-center gap-3 mb-1">
                                       <span className="text-[10px] font-space-grotesque font-medium text-primary uppercase">{opt.code}</span>
                                       <span className="text-[10px] font-space-grotesque font-medium text-white/20 uppercase">• {opt.credits} CR</span>
                                   </div>
                                   <p className="font-outfit font-medium text-white/80 group-hover:text-white transition-colors">{opt.name}</p>
                               </div>
                               <Plus size={18} className="text-white/10 group-hover:text-primary transition-colors" />
                           </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
 
         {/* Footer Area */}
         <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center shrink-0">
           <p className="text-[8px] font-space-grotesque font-black text-white/20 uppercase tracking-[0.5em]">GPAfy Engine v2.0</p>
         </div>
       </div>
     </div>
   );
}
