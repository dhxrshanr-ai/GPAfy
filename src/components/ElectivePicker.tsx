import { Subject } from '@/types';
import { X, Search, Plus, Check, Lock } from 'lucide-react';
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
  title,
  excludedCodes = new Set()
}: {
  isOpen: boolean;
  onClose: () => void;
  options: Subject[];
  onSelect: (sub: Subject) => void;
  title: string;
  excludedCodes?: Set<string>;
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
  const masterMatchExcluded = masterMatch ? excludedCodes.has(masterMatch.code) : false;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-10 pointer-events-auto"
      style={{ background: 'rgba(8, 20, 16, 0.7)' }}
      onClick={onClose}
    >
      <div 
        className="bg-[#FBFDFB] w-full max-w-xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[85vh] border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-500 scale-[0.99] sm:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Section: High-End Emerald Gradient */}
        <div className="relative shrink-0 pt-8 px-8 pb-6 bg-gradient-to-br from-[#059669] to-[#047857] shadow-xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
             <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] rotate-12 bg-[radial-gradient(circle,white_0%,transparent_70%)] opacity-30" />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-space-grotesque font-black text-emerald-100 uppercase tracking-[0.4em] mb-1 opacity-80">Orbit Selector</p>
              <h3 className="font-outfit font-black text-2xl text-white tracking-tight leading-tight">
                {title}
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 border border-white/20 active:scale-90"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="relative z-10 group">
             <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Search className="text-white/40 group-focus-within:text-white transition-colors duration-300" size={18} strokeWidth={3} />
             </div>
             <input 
               type="text" 
               placeholder="SEARCH BY CODE OR NAME..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               autoFocus
               className="w-full pl-14 pr-12 py-4.5 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-space-grotesque font-bold focus:bg-white/20 focus:border-white focus:ring-4 focus:ring-white/10 transition-all duration-300 outline-none text-white placeholder:text-white/40 tracking-widest uppercase shadow-inner"
             />
             {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X size={14} className="text-white" strokeWidth={3} />
                </button>
             )}
          </div>
        </div>

        {/* Dynamic Fetch Area */}
        <div className="overflow-y-auto p-8 grow scrollbar-hide space-y-8 bg-[#FBFDFB]">
            
            {/* Direct Match Result */}
            {searchQuery.trim().length >= 2 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                      <p className="text-[9px] font-space-grotesque font-black text-[#059669]/60 uppercase tracking-[0.4em]">Engine Match</p>
                    </div>
                    {masterMatch ? (
                        masterMatchExcluded ? (
                          <div className="w-full text-left bg-gray-50 border border-gray-100 p-6 rounded-[2rem] opacity-60 cursor-not-allowed">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-gray-200 text-gray-500 text-[10px] font-space-grotesque font-bold rounded-lg tracking-widest">
                                  {masterMatch.code}
                                </span>
                                <span className="text-[10px] font-space-grotesque font-bold text-gray-300 tracking-widest uppercase">
                                  {masterMatch.credits} CREDITS
                                </span>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                                <Lock size={12} className="text-rose-400" />
                                <span className="text-[10px] font-space-grotesque font-black text-rose-500 uppercase tracking-widest">In Use</span>
                              </div>
                            </div>
                            <h4 className="text-lg font-outfit font-black text-gray-400 leading-tight uppercase">
                              {masterMatch.name}
                            </h4>
                          </div>
                        ) : (
                        <button
                          onClick={() => { onSelect({ ...masterMatch, type: 'theory' } as Subject); onClose(); }}
                          className="w-full text-left bg-white border-2 border-[#059669]/30 p-7 rounded-[2rem] hover:border-[#059669] hover:bg-emerald-50/30 transition-all duration-300 group shadow-[0_10px_30px_rgba(5,150,105,0.08)] hover:shadow-[0_15px_45px_rgba(5,150,105,0.15)] relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-[#059669] text-white text-[10px] font-space-grotesque font-black rounded-lg tracking-widest shadow-lg shadow-emerald-500/20">
                                        {masterMatch.code}
                                    </span>
                                    <span className="text-[10px] font-space-grotesque font-bold text-gray-400 tracking-widest uppercase">
                                        {masterMatch.credits} CREDITS
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform">
                                  <Check size={20} strokeWidth={3} />
                                </div>
                            </div>
                            <h4 className="text-xl font-outfit font-black text-gray-900 leading-tight uppercase tracking-tight relative z-10">
                                {masterMatch.name}
                            </h4>
                            <div className="mt-4 pt-4 border-t border-[#059669]/10 flex items-center gap-2 text-[10px] font-space-grotesque font-black text-[#059669] uppercase tracking-[0.2em] relative z-10">
                                <Plus size={14} strokeWidth={4} /> ATTACH TO SEMESTER
                            </div>
                        </button>
                        )
                    ) : (
                        <div className="bg-gray-50/50 border-2 border-dashed border-gray-100 p-10 rounded-[2.5rem] text-center">
                             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                                <Search className="text-gray-200" size={24} />
                             </div>
                             <p className="text-gray-400 font-space-grotesque font-bold text-xs tracking-[0.2em] uppercase max-w-[200px] mx-auto leading-relaxed">
                                {searchQuery.trim().length < 5 ? "Searching Registry..." : `No matches found for ${searchQuery.trim().toUpperCase()}`}
                             </p>
                             {searchQuery.trim().length >= 5 && (
                                <button 
                                  onClick={() => {
                                      onSelect({
                                          code: searchQuery.trim().toUpperCase(),
                                          name: "Custom Subject Entry",
                                          credits: 3,
                                          type: 'theory'
                                      } as Subject);
                                      onClose();
                                  }}
                                  className="mt-6 px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-space-grotesque font-black hover:bg-emerald-600 transition-all duration-300 uppercase tracking-[0.3em] active:scale-95"
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
                <div className="animate-in fade-in duration-700">
                    <p className="text-[10px] font-space-grotesque font-black text-gray-300 uppercase tracking-[0.4em] mb-6 ml-2">Suggested Orbits</p>
                    <div className="flex flex-col gap-4">
                        {options.map((opt) => {
                          const isExcluded = excludedCodes.has(opt.code);
                          return isExcluded ? (
                            <div
                              key={opt.code}
                              className="w-full text-left p-6 rounded-[2rem] bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[11px] font-space-grotesque font-bold text-gray-400 uppercase tracking-widest">{opt.code}</span>
                                  <span className="text-[10px] font-space-grotesque font-medium text-gray-300 uppercase tracking-widest">• {opt.credits} CR</span>
                                </div>
                                <p className="font-outfit font-black text-gray-400 text-base uppercase tracking-tight">{opt.name}</p>
                              </div>
                              <div className="shrink-0 ml-4">
                                <div className="px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-300">
                                  <Lock size={14} />
                                </div>
                              </div>
                            </div>
                          ) : (
                           <button
                             key={opt.code}
                             onClick={() => { onSelect(opt); onClose(); }}
                             className="w-full text-left p-6 rounded-[2rem] bg-white border border-gray-100 hover:border-[#059669]/30 hover:shadow-[0_12px_40px_rgba(5,150,105,0.06)] transition-all duration-300 flex items-center justify-between group active:scale-[0.98]"
                           >
                               <div className="flex-1 pr-6">
                                   <div className="flex items-center gap-3 mb-2">
                                       <span className="text-[11px] font-space-grotesque font-black text-[#059669] uppercase tracking-[0.2em]">{opt.code}</span>
                                       <span className="text-[10px] font-space-grotesque font-bold text-gray-300 uppercase tracking-widest">• {opt.credits} CR</span>
                                   </div>
                                   <p className="font-outfit font-black text-gray-800 text-base group-hover:text-black transition-colors uppercase tracking-tight leading-tight">{opt.name}</p>
                               </div>
                               <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-[#059669] group-hover:scale-110 transition-all duration-300 shrink-0 border border-transparent group-hover:border-emerald-100">
                                 <Plus size={22} strokeWidth={3} />
                               </div>
                           </button>
                          );
                        })}
                    </div>
                </div>
            )}
        </div>
  
         {/* Footer Area */}
         <div className="p-8 bg-[#FBFDFB] border-t border-gray-50 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[9px] font-space-grotesque font-black text-gray-300 uppercase tracking-[0.5em]">GPAfy Engine v2.0</p>
           </div>
           <p className="text-[9px] font-space-grotesque font-black text-gray-400 uppercase tracking-widest opacity-50">Precision Calculator Module</p>
         </div>
       </div>
    </div>
  );
}
