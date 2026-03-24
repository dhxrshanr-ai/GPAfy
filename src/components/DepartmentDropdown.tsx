import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentDropdownProps {
  value: string;
  options: string[];
  onChange: (dept: string) => void;
}

export function DepartmentDropdown({ value, options, onChange }: DepartmentDropdownProps) {
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
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-16 bg-gray-50 border rounded-[1.5rem] px-6 text-gray-900 font-space-grotesque font-black text-lg outline-none transition-all cursor-pointer shadow-inner flex items-center justify-between group",
          isOpen ? "border-primary bg-emerald-50" : "border-gray-200 hover:border-primary/40"
        )}
      >
        <span>{value || 'Select Department'}</span>
        <div className={cn(
          "text-primary/50 group-hover:text-primary transition-all duration-300",
          isOpen && "rotate-180 text-primary"
        )}>
          <ChevronDown size={24} strokeWidth={3} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-[1.5rem] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[70] flex flex-col gap-1 backdrop-blur-xl max-h-[300px] overflow-y-auto scrollbar-hide"
          >
            {options.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  onChange(dept);
                  setIsOpen(false);
                }}
                className={cn(
                  "p-4 rounded-xl font-space-grotesque font-black text-left transition-colors flex items-center justify-between shrink-0",
                  value === dept
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                )}
              >
                <span>{dept}</span>
                {value === dept && (
                  <motion.div 
                    layoutId="activeDeptIndicator"
                    className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,85,0,0.5)]" 
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
