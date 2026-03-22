import { SubjectRow } from './SubjectRow';
import { Subject } from '@/types';
import { calculateSGPA } from '@/lib/gpa';
import { useGpaStore } from '@/store/useGpaStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, ChevronDown } from 'lucide-react';
import { ElectivePicker } from './ElectivePicker';
import { cn } from '@/lib/utils';

export function SemesterSection({ 
  semNumber, 
  isOpen, 
  onToggle,
  showSgpa = true,
  variant = 'accordion'
}: { 
  semNumber: number; 
  isOpen: boolean; 
  onToggle: () => void;
  showSgpa?: boolean;
  variant?: 'accordion' | 'standalone';
}) {
  const { getGrade, setGrade, getSelection, setSelection, extraSubjects, addExtraSubject, removeExtraSubject, regulation, department, subjectCounts, setSubjectCount } = useGpaStore();
  
  // Elective Modal State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTitle, setPickerTitle] = useState<string | null>(null);
  const [pickerOptions, setPickerOptions] = useState<Subject[]>([]);
  const [activePlaceholder, setActivePlaceholder] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentExtraSubjects = extraSubjects[regulation]?.[department]?.[semNumber] || [];
  const currentSubjectCount = subjectCounts[regulation]?.[department]?.[semNumber] || 0;
  
  const [localCount, setLocalCount] = useState<string>('');

  // Generate slots if count is set
  const manualSlots = Array.from({ length: currentSubjectCount }, (_, i) => {
    const slotCode = `SLOT_${semNumber}_${i + 1}`;
    const selectedCode = getSelection(semNumber, slotCode);
    
    if (selectedCode) {
       // Find the full subject data from master lists
       const store = useGpaStore.getState();
       const allSubjects = [
         ...store.getMasterSubjects(regulation),
         ...store.getElectivePools(regulation)
       ];
       const found = allSubjects.find(s => s.code === selectedCode);
       if (found) return { ...found, slotCode } as Subject;
    }

    return {
      code: slotCode,
      name: `Subject ${i + 1}`,
      credits: 3,
      type: 'theory',
      isPlaceholder: true,
      options: [] // To satisfy the type check and show as selectable
    } as Subject;
  });

  const combinedSubjects = manualSlots;

  const semesterInputs = combinedSubjects.map(s => {
    if (s.options) {
      const pickedCode = getSelection(semNumber, s.code);
      const pickedSubject = pickedCode ? s.options.find((opt: Subject) => opt.code === pickedCode) : null;
      return {
        credits: pickedSubject ? pickedSubject.credits : s.credits,
        type: pickedSubject ? pickedSubject.type : s.type,
        grade: pickedCode ? getGrade(semNumber, pickedCode) : ''
      };
    }
    return {
      credits: s.credits,
      type: s.type,
      grade: getGrade(semNumber, s.code)
    };
  });
  
  const sgpa = calculateSGPA(semesterInputs);
  

  const rows: React.ReactNode[] = [];

  const openElectivePicker = (placeholderCode: string, options: Subject[], title: string) => {
    setActivePlaceholder(placeholderCode);
    const store = useGpaStore.getState();
    const isManualSlot = placeholderCode.startsWith('SLOT_');
    
    // If it's a manual slot, we show ALL possible subjects as "options"
    if (isManualSlot) {
      setPickerOptions([
        ...store.getMasterSubjects(regulation),
        ...store.getElectivePools(regulation)
      ]);
      setPickerTitle("Select Subject");
    } else {
      setPickerOptions(options);
      setPickerTitle(title);
    }
    setPickerOpen(true);
  };

  combinedSubjects.forEach((s, index) => {
    const isExtra = currentExtraSubjects.some((ext: Subject) => ext.code === s.code);
    const isLastTwo = index >= combinedSubjects.length - 2;

    if (s.options) {
      const pickedCode = getSelection(semNumber, s.code);
      const pickedSubject = pickedCode ? s.options.find((opt: Subject) => opt.code === pickedCode) : null;
      
      if (pickedSubject) {
        rows.push(
          <SubjectRow 
            key={pickedSubject.code} 
            subject={pickedSubject} 
            grade={getGrade(semNumber, pickedSubject.code)} 
            onGradeChange={(val) => setGrade(semNumber, pickedSubject.code, val)}
            onElectiveChange={() => openElectivePicker(s.code, s.options!, s.name)} 
            dropUp={isLastTwo}
          />
        );
      } else {
        rows.push(
          <SubjectRow 
            key={`placeholder-${s.code}`}
            subject={s}
            grade=""
            onGradeChange={() => {}}
            isElectivePlaceholder={true}
            onElectiveChange={() => openElectivePicker(s.code, s.options!, s.name)}
            dropUp={isLastTwo}
          />
        );
      }
    } else {
      rows.push(
        <SubjectRow 
          key={s.code} 
          subject={s} 
          grade={getGrade(semNumber, s.code)} 
          onGradeChange={(val) => setGrade(semNumber, s.code, val)} 
          isExtraSubject={isExtra}
          onRemove={isExtra ? () => removeExtraSubject(semNumber, s.code) : undefined}
          dropUp={isLastTwo}
        />
      );
    }
  });

  const content = (
    <div className="p-5 sm:p-6 pt-0 border-t border-white/5 mt-2 bg-white/[0.02] rounded-b-[2.5rem]">
      {currentSubjectCount === 0 ? (
        <div className="pt-8 pb-4">
          <div className="flex flex-col items-center text-center gap-8 relative z-10">
            <div className="space-y-4">
              <p className="text-[10px] font-space-grotesque font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">
                Action Required
              </p>
              <h3 className="text-xl font-outfit font-bold text-white/90 leading-tight">
                Refer to your result screen and enter the <br/>
                <span className="text-rose-500 text-2xl font-black tracking-tight">following details carefully.</span>
              </h3>
            </div>

            <div className="w-full max-w-sm space-y-6">
              <div className="space-y-3">
                <label className="block text-[11px] font-space-grotesque font-bold text-rose-500/60 uppercase tracking-widest text-left ml-2">
                  Enter the Total Number of Subjects in Your {semNumber}{semNumber === 1 ? 'st' : semNumber === 2 ? 'nd' : semNumber === 3 ? 'rd' : 'th'} Semester
                </label>
                <div className="relative group/input">
                  <input 
                    type="number" 
                    placeholder="e.g. 8"
                    value={localCount}
                    onChange={(e) => setLocalCount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 font-outfit font-black text-2xl text-white placeholder:text-white/10 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all duration-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-space-grotesque font-bold text-white/20 uppercase tracking-widest pointer-events-none">
                    Units
                  </div>
                </div>
                <p className="text-[9px] font-space-grotesque font-black text-white/20 uppercase tracking-[0.3em] ml-2">
                  [All Subjects Including Practicals]
                </p>
              </div>

              <button 
                onClick={() => {
                  const num = parseInt(localCount);
                  if (num > 0 && num <= 20) {
                    setSubjectCount(semNumber, num);
                  }
                }}
                disabled={!localCount || parseInt(localCount) <= 0}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-20 disabled:grayscale text-white font-space-grotesque font-black py-5 rounded-2xl transition-all duration-300 shadow-[0_10px_40px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_50px_rgba(244,63,94,0.5)] active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
              >
                Initialize Semester
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <motion.div layout className="pt-6 flex flex-col gap-4 relative">
            <AnimatePresence mode="popLayout">
              {rows.map((row, i) => (
                <motion.div 
                  layout
                  key={(row as React.ReactElement).key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative transition-all duration-300 hover:!z-[70] focus-within:!z-[70]" 
                  style={{ zIndex: 50 - i }}
                >
                  {row}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          <button 
            onClick={() => openElectivePicker('EXTRA_SUBJECT', [], 'Additional Subject')}
            className="w-full flex items-center justify-center gap-3 p-5 mt-2 border-2 border-dashed border-white/10 rounded-2xl text-white/40 hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-weightless text-[10px] font-space-grotesque font-black uppercase tracking-[0.2em] active:scale-95 group relative z-0"
          >
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" /> Add Custom Subject
          </button>

          <button 
            onClick={() => {
               if (confirm('Are you sure you want to reset all data for Semester ' + semNumber + '? This will also clear the subject count.')) {
                  useGpaStore.getState().resetSemester(semNumber);
               }
            }}
            className="w-full flex items-center justify-center gap-3 p-4 mt-2 bg-white/5 border border-[#FF4D4D]/20 rounded-2xl text-[#FF4D4D]/70 hover:text-[#FF4D4D] hover:border-[#FF4D4D]/40 hover:bg-[#FF4D4D]/10 transition-weightless text-[9px] font-space-grotesque font-black uppercase tracking-[0.3em] active:scale-95 group"
          >
            <RotateCcw size={14} strokeWidth={3} className="group-hover:-rotate-90 transition-transform duration-500" /> Reset Semester
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className={cn(
      "glass-panel rounded-[2.5rem] mb-8 transition-weightless group/semester animate-float depth-tilt border-primary/20",
      semNumber % 2 === 0 ? "animation-delay-500" : "",
      variant === 'standalone' && "mb-0"
    )}>
       {variant === 'accordion' && (
         <div 
           className="p-6 flex justify-between items-center cursor-pointer select-none relative overflow-hidden"
           onClick={onToggle}
         >
           <div className="flex items-center gap-5 z-10">
             <div className={cn(
               "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-weightless font-space-grotesque font-black text-sm",
               currentSubjectCount > 0 
                 ? "bg-primary border-white text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]" 
                 : "bg-white/5 border-white/10 text-white/40"
             )}>
               {semNumber}
             </div>
             <div>
               <h3 className="font-space-grotesque text-xs font-black text-white uppercase tracking-[0.3em] group-hover/semester:text-primary transition-colors">
                 Semester {semNumber}
               </h3>
               <p className="text-[9px] font-space-grotesque font-black text-white/40 uppercase tracking-[0.2em] mt-1">
                 {currentSubjectCount > 0 ? `${currentSubjectCount} Slots Active` : 'Refer to Result Screen'}
               </p>
             </div>
           </div>

           <div className="flex items-center gap-4 z-10">
             {showSgpa && sgpa > 0 && (
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-space-grotesque font-black text-primary uppercase tracking-[0.2em] mb-1 text-glow-orange">Semester GPA</span>
                 <span className="text-2xl font-space-grotesque font-black text-white tracking-tighter text-glow-orange">{sgpa.toFixed(2)}</span>
               </div>
             )}
             <div className={cn(
               "p-2 rounded-full transition-weightless",
               isOpen ? "bg-primary/20 text-primary rotate-180" : "text-white/30 group-hover/semester:text-white"
             )}>
               <ChevronDown size={20} />
             </div>
           </div>
           
           {/* Subtle internal glow */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
         </div>
       )}

       {variant === 'standalone' ? (
         <div className="pt-6">
           {content}
         </div>
       ) : (
         <AnimatePresence>
           {isOpen && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               transition={{ duration: 0.4 }}
               onAnimationStart={() => setIsAnimating(true)}
               onAnimationComplete={() => setIsAnimating(false)}
               className={isAnimating ? "overflow-hidden" : "overflow-visible"}
             >
               {content}
             </motion.div>
           )}
         </AnimatePresence>
       )}

       <ElectivePicker 
         isOpen={pickerOpen} 
         onClose={() => setPickerOpen(false)} 
         title={pickerTitle || ''}
         options={pickerOptions}
         onSelect={(subject) => {
            if (activePlaceholder === 'EXTRA_SUBJECT') {
               addExtraSubject(semNumber, subject);
            } else if (activePlaceholder) {
               setSelection(semNumber, activePlaceholder, subject.code);
            }
            setPickerOpen(false);
         }}
       />
    </div>
  );
}
