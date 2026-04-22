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

  const queryLower = searchQuery.trim().toLowerCase();
  const searchResults = queryLower.length >= 2 
    ? (Object.values(masterRegistry) as Subject[]).filter(s => 
        (s.code && s.code.toLowerCase().includes(queryLower)) || 
        (s.name && s.name.toLowerCase().includes(queryLower))
      ).slice(0, 8)
    : [];

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-10 pointer-events-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#FBFDFB] w-full max-w-xl rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[85vh] border border-white/50 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sleek Header Section */}
        <div className="relative shrink-0 pt-8 px-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-space-grotesque font-black text-[#059669]/60 uppercase tracking-[0.4em] mb-1">Orbit Selector</p>
              <h3 className="font-outfit font-black text-2xl text-gray-900 tracking-tight">
                {title}
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-all duration-300 active:scale-95"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="relative group">
             <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Search className="text-gray-300 group-focus-within:text-[#059669] transition-colors duration-300" size={18} strokeWidth={2.5} />
             </div>
             <input 
               type="text" 
               placeholder="SEARCH BY CODE OR NAME..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               autoFocus
               className="w-full pl-12 pr-12 py-4 bg-gray-50/80 border border-gray-100 rounded-[1.5rem] text-sm font-space-grotesque font-bold focus:bg-white focus:border-[#059669]/30 focus:ring-4 focus:ring-[#059669]/10 transition-all duration-300 outline-none text-gray-800 placeholder:text-gray-300 tracking-[0.1em] uppercase"
             />
             {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={14} className="text-gray-500" strokeWidth={3} />
                </button>
             )}
          </div>
        </div>

        {/* Dynamic Fetch Area */}
        <div className="overflow-y-auto px-8 pb-8 pt-2 grow scrollbar-hide space-y-8 bg-transparent">
            
            {/* Direct Match Result */}
            {searchQuery.trim().length >= 2 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                      <p className="text-[9px] font-space-grotesque font-black text-[#059669]/60 uppercase tracking-[0.4em]">Engine Match</p>
                    </div>
                    {searchResults.length > 0 ? (
                        <div className="flex flex-col gap-4">
                           {searchResults.map(match => {
                               const isExcluded = excludedCodes.has(match.code);
                               return isExcluded ? (
                                  <div key={match.code} className="w-full text-left bg-gray-50 border border-gray-100 p-6 rounded-[2rem] opacity-60 cursor-not-allowed">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-gray-200 text-gray-500 text-[10px] font-space-grotesque font-bold rounded-lg tracking-widest">
                                          {match.code}
                                        </span>
                                        <span className="text-[10px] font-space-grotesque font-bold text-gray-400 tracking-widest uppercase">
                                          {match.credits} CREDITS
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                                        <Lock size={12} className="text-rose-400" />
                                        <span className="text-[10px] font-space-grotesque font-black text-rose-500 uppercase tracking-widest">In Use</span>
                                      </div>
                                    </div>
                                    <h4 className="text-lg font-outfit font-black text-gray-500 leading-tight uppercase">
                                      {match.name}
                                    </h4>
                                  </div>
                               ) : (
                                  <button
                                    key={match.code}
                                    onClick={() => { onSelect({ ...match, type: 'theory' } as Subject); onClose(); }}
                                    className="w-full text-left bg-white border border-gray-100 p-7 rounded-[2rem] hover:border-[#059669]/30 hover:shadow-[0_15px_40px_rgba(5,150,105,0.08)] transition-all duration-300 group relative overflow-hidden active:scale-[0.98]"
                                  >
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      <div className="flex items-center justify-between mb-4 relative z-10">
                                          <div className="flex items-center gap-3">
                                              <span className="px-3 py-1 bg-[#059669]/10 text-[#059669] text-[10px] font-space-grotesque font-black rounded-lg tracking-widest group-hover:bg-[#059669] group-hover:text-white transition-colors">
                                                  {match.code}
                                              </span>
                                              <span className="text-[10px] font-space-grotesque font-bold text-gray-400 tracking-widest uppercase">
                                                  {match.credits} CREDITS
                                              </span>
                                          </div>
                                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-[#059669] group-hover:scale-110 transition-all">
                                            <Check size={18} strokeWidth={3} />
                                          </div>
                                      </div>
                                      <h4 className="text-xl font-outfit font-black text-gray-900 leading-tight uppercase tracking-tight relative z-10">
                                          {match.name}
                                      </h4>
                                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] font-space-grotesque font-black text-gray-400 group-hover:text-[#059669] uppercase tracking-[0.2em] relative z-10 transition-colors">
                                          <Plus size={14} strokeWidth={4} /> ATTACH TO SEMESTER
                                      </div>
                                  </button>
                               );
                           })}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-100 p-10 rounded-[2.5rem] text-center">
                             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                                <Search className="text-gray-300" size={24} />
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
                                  className="mt-6 px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-space-grotesque font-black hover:bg-black transition-all duration-300 uppercase tracking-[0.3em] active:scale-95 shadow-lg"
                                >
                                    Force Generate
                                </button>
                             )}
                        </div>
                    )}
                </div>
            )}

            {/* Suggested Options */}
            {options.length > 0 && searchResults.length === 0 && (
                <div className="animate-in fade-in duration-700">
                    <p className="text-[10px] font-space-grotesque font-black text-gray-300 uppercase tracking-[0.4em] mb-4 ml-2">Suggested Orbits</p>
                    <div className="flex flex-col gap-3">
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
                             className="w-full text-left p-5 sm:p-6 rounded-[2rem] bg-white border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex items-center justify-between group active:scale-[0.98]"
                           >
                               <div className="flex-1 pr-4">
                                   <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                                       <span className="text-[11px] font-space-grotesque font-black text-[#059669] uppercase tracking-[0.2em]">{opt.code}</span>
                                       <span className="text-[10px] font-space-grotesque font-bold text-gray-300 uppercase tracking-widest">• {opt.credits} CR</span>
                                   </div>
                                   <p className="font-outfit font-black text-gray-800 text-sm sm:text-base group-hover:text-black transition-colors uppercase tracking-tight leading-tight">{opt.name}</p>
                               </div>
                               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50/80 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#059669]/10 group-hover:text-[#059669] group-hover:scale-110 transition-all duration-300 shrink-0">
                                 <Plus size={20} strokeWidth={2.5} />
                               </div>
                           </button>
                          );
                        })}
                    </div>
                </div>
            )}
        </div>
  
         {/* Footer Area */}
         <div className="p-6 sm:p-8 bg-gray-50/50 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
             <p className="text-[9px] font-space-grotesque font-black text-gray-400 uppercase tracking-[0.4em]">GPAfy Engine v2.0</p>
           </div>
           <p className="text-[8px] sm:text-[9px] font-space-grotesque font-black text-gray-300 uppercase tracking-widest hidden sm:block">Precision Calculator Module</p>
         </div>
       </div>
    </div>
  );
}
