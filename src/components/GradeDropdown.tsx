import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'RA'];

export function GradeDropdown({ value, onChange, dropUp = false }: { value?: string, onChange: (v: string) => void, dropUp?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "h-12 w-28 sm:w-32 px-4 rounded-2xl border-2 flex items-center justify-between gap-2 font-space-grotesque font-black text-xs sm:text-sm transition-colors",
          value
            ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(255,85,0,0.4)]"
            : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40 hover:text-primary"
        )}
      >
        <span>{value || 'GRADE'}</span>
        <ChevronDown size={16} className={cn("transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 10 : -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "absolute right-0 w-32 bg-[#111111]/95 border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] flex flex-col gap-1 backdrop-blur-xl max-h-[220px] overflow-y-auto scrollbar-hide",
              dropUp ? "bottom-full mb-3" : "top-full mt-2"
            )}
          >
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(g);
                  setIsOpen(false);
                }}
                className={cn(
                  "p-3 rounded-xl font-space-grotesque font-black text-sm text-left transition-all relative group/item active:scale-95",
                  value === g
                    ? "text-primary"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                {value === g && (
                  <motion.div 
                    layoutId={`activeGrade-${value}`}
                    className="absolute inset-0 bg-primary/20 rounded-xl border border-primary/30"
                  />
                )}
                <span className="relative z-10">{g}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
