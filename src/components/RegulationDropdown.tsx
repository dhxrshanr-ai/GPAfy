import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegulationDropdownProps {
  value: string;
  options: { reg: string; label: string }[];
  onChange: (reg: string) => void;
}

export function RegulationDropdown({ value, options, onChange }: RegulationDropdownProps) {
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

  const selectedOption = options.find(o => o.reg === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-20 bg-gray-50 border rounded-[1.5rem] px-6 text-gray-900 outline-none transition-all cursor-pointer shadow-inner flex items-center justify-between group",
          isOpen ? "border-primary bg-emerald-50" : "border-gray-200 hover:border-primary/40"
        )}
      >
        <div className="flex flex-col items-start">
          <span className="font-space-grotesque font-black text-xl tracking-tighter">{value}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 group-hover:text-gray-600 transition-opacity">
            {selectedOption?.label.split(' ')[1]} {selectedOption?.label.split(' ')[2]}
          </span>
        </div>
        <div className={cn(
          "text-primary/50 group-hover:text-primary transition-all duration-300",
          isOpen && "rotate-180 text-primary"
        )}>
          <ChevronDown size={28} strokeWidth={3} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-[1.5rem] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[100] flex flex-col gap-1 backdrop-blur-2xl"
          >
            {options.map((opt) => (
              <button
                key={opt.reg}
                onClick={() => {
                  onChange(opt.reg);
                  setIsOpen(false);
                }}
                className={cn(
                  "p-5 rounded-xl transition-colors flex items-center justify-between group/opt shrink-0",
                  value === opt.reg
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                )}
              >
                <div className="flex flex-col items-start">
                   <span className="font-space-grotesque font-black text-lg tracking-tighter">{opt.reg}</span>
                   <span className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-50">{opt.label}</span>
                </div>
                {value === opt.reg && (
                  <motion.div 
                    layoutId="activeRegIndicator"
                    className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,85,0,0.5)]" 
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
