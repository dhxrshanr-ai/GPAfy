import { SubjectRow } from './SubjectRow';
import { Subject } from '@/types';
import { calculateSGPA } from '@/lib/gpa';
import { useGpaStore } from '@/store/useGpaStore';
import { useState } from 'react';
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
  const [pickerExcludedCodes, setPickerExcludedCodes] = useState<Set<string>>(new Set());
  const [activePlaceholder, setActivePlaceholder] = useState<string | null>(null);
  
  // Track if accordion is fully expanded to allow dropdown overflow
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  
  // Track which row has an open dropdown to lift its z-index
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
    // Use slotCode as grade key for resolved manual slots
    const gradeKey = s.slotCode || s.code;
    return {
      credits: s.credits,
      type: s.type,
      grade: getGrade(semNumber, gradeKey)
    };
  });
  
  const sgpa = calculateSGPA(semesterInputs);
  

  const rows: React.ReactNode[] = [];

  const openElectivePicker = (placeholderCode: string, options: Subject[], title: string) => {
    setActivePlaceholder(placeholderCode);
    const store = useGpaStore.getState();
    const isManualSlot = placeholderCode.startsWith('SLOT_');
    
    // Collect codes already selected in OTHER slots of this semester
    const excludedCodes = new Set<string>();
    Array.from({ length: currentSubjectCount }, (_, i) => {
      const sc = `SLOT_${semNumber}_${i + 1}`;
      if (sc !== placeholderCode) {
        const picked = store.getSelection(semNumber, sc);
        if (picked) excludedCodes.add(picked);
      }
    });
    setPickerExcludedCodes(excludedCodes);

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
            key={`slot-${s.code}`}
            slotId={`sem${semNumber}-${s.code}`}
            subject={pickedSubject} 
            grade={getGrade(semNumber, pickedSubject.code)} 
            onGradeChange={(val) => setGrade(semNumber, pickedSubject.code, val)}
            onElectiveChange={() => openElectivePicker(s.code, s.options!, s.name)} 
            dropUp={isLastTwo}
            onOpenChange={(isOpen) => isOpen ? setActiveDropdown(`slot-${s.code}`) : setActiveDropdown(null)}
          />
        );
      } else {
        rows.push(
          <SubjectRow 
            key={`placeholder-${s.code}`}
            slotId={`sem${semNumber}-${s.code}`}
            subject={s}
            grade=""
            onGradeChange={() => {}}
            isElectivePlaceholder={true}
            onElectiveChange={() => openElectivePicker(s.code, s.options!, s.name)}
            dropUp={isLastTwo}
            onOpenChange={(isOpen) => isOpen ? setActiveDropdown(`placeholder-${s.code}`) : setActiveDropdown(null)}
          />
        );
      }
    } else {
      // For resolved manual slots (slotCode set), use the slot code as grade key
      // so two slots picking the same subject have independent grades.
      const gradeKey = s.slotCode || s.code;
      const isManualResolved = !!s.slotCode; // slotCode is set only on resolved manual slots
      rows.push(
        <SubjectRow 
          key={gradeKey}
          slotId={`sem${semNumber}-${gradeKey}`}
          subject={s} 
          grade={getGrade(semNumber, gradeKey)} 
          onGradeChange={(val) => setGrade(semNumber, gradeKey, val)} 
          isExtraSubject={isExtra}
          isLocked={isManualResolved}
          onElectiveChange={isManualResolved ? () => openElectivePicker(s.slotCode!, [], s.name) : undefined}
          onRemove={isExtra ? () => removeExtraSubject(semNumber, s.code) : undefined}
          dropUp={isLastTwo}
          onOpenChange={(isOpen) => isOpen ? setActiveDropdown(gradeKey) : setActiveDropdown(null)}
        />
      );
    }
  });

  const content = (
    <div className="p-5 sm:p-6 pt-0 border-t border-gray-100 mt-2 bg-gray-50/50 rounded-b-[2.5rem]">
      {currentSubjectCount === 0 ? (
        <div className="pt-8 pb-4">
          <div className="flex flex-col items-center text-center gap-8 relative z-10">
            <div className="space-y-4">
              <p className="text-[10px] font-space-grotesque font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">
                Action Required
              </p>
              <h3 className="text-xl font-outfit font-bold text-gray-800 leading-tight">
                Refer to your result screen and enter the <br/>
                <span className="text-rose-500 text-2xl font-black tracking-tight">following details carefully.</span>
              </h3>
            </div>

            <div className="w-full max-w-sm space-y-6">
              <div className="space-y-3">
                <label className="block text-[11px] font-space-grotesque font-bold text-rose-500/70 uppercase tracking-widest text-left ml-2">
                  Enter the Total Number of Subjects in Your {semNumber}{semNumber === 1 ? 'st' : semNumber === 2 ? 'nd' : semNumber === 3 ? 'rd' : 'th'} Semester
                </label>
                <div className="relative group/input">
                  <input 
                    type="number" 
                    placeholder="e.g. 8"
                    value={localCount}
                    onChange={(e) => setLocalCount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 font-outfit font-black text-2xl text-gray-900 placeholder:text-gray-200 focus:border-rose-400/60 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all duration-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-space-grotesque font-bold text-gray-300 uppercase tracking-widest pointer-events-none">
                    Units
                  </div>
                </div>
                <p className="text-[9px] font-space-grotesque font-black text-gray-400 uppercase tracking-[0.3em] ml-2">
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
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-30 disabled:grayscale text-white font-space-grotesque font-black py-5 rounded-2xl transition-all duration-300 shadow-[0_6px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_10px_35px_rgba(244,63,94,0.35)] active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
              >
                Initialize Semester
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="pt-6 flex flex-col gap-4 relative">
            {rows.map((row, i) => {
              const rowId = (row as React.ReactElement).key as string;
              const isActive = activeDropdown === rowId;
              
              return (
                <div
                  key={rowId}
                  className={cn(
                    "relative transition-all duration-200",
                    isActive ? "z-[100]" : "focus-within:z-[80] hover:z-[75]"
                  )}
                  style={{ zIndex: isActive ? 100 : 50 - i }}
                >
                  {row}
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={() => openElectivePicker('EXTRA_SUBJECT', [], 'Additional Subject')}
            className="w-full flex items-center justify-center gap-3 p-5 mt-2 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-emerald-50 transition-weightless text-[10px] font-space-grotesque font-black uppercase tracking-[0.2em] active:scale-95 group relative z-0"
          >
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" /> Add Custom Subject
          </button>

          <button 
            onClick={() => {
               if (confirm('Are you sure you want to reset all data for Semester ' + semNumber + '? This will also clear the subject count.')) {
                  useGpaStore.getState().resetSemester(semNumber);
               }
            }}
            className="w-full flex items-center justify-center gap-3 p-4 mt-2 bg-gray-50 border border-red-200 rounded-2xl text-red-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-weightless text-[9px] font-space-grotesque font-black uppercase tracking-[0.3em] active:scale-95 group"
          >
            <RotateCcw size={14} strokeWidth={3} className="group-hover:-rotate-90 transition-transform duration-500" /> Reset Semester
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className={cn(
      "glass-panel rounded-[2.5rem] mb-8 border-primary/10",
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
                 ? "bg-primary border-primary text-white shadow-[0_4px_15px_rgba(255,85,0,0.3)]" 
                 : "bg-gray-100 border-gray-200 text-gray-400"
             )}>
               {semNumber}
             </div>
             <div>
               <h3 className="font-space-grotesque text-xs font-black text-gray-800 uppercase tracking-[0.3em] group-hover/semester:text-primary transition-colors">
                 Semester {semNumber}
               </h3>
               <p className="text-[9px] font-space-grotesque font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                 {currentSubjectCount > 0 ? `${currentSubjectCount} Slots Active` : 'Refer to Result Screen'}
               </p>
             </div>
           </div>

           <div className="flex items-center gap-4 z-10">
             {showSgpa && sgpa > 0 && (
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-space-grotesque font-black text-primary uppercase tracking-[0.2em] mb-1">Semester GPA</span>
                 <span className="text-2xl font-space-grotesque font-black text-gray-900 tracking-tighter">{sgpa.toFixed(2)}</span>
               </div>
             )}
             <div className={cn(
               "p-2 rounded-full transition-weightless",
               isOpen ? "bg-primary/10 text-primary rotate-180" : "text-gray-300 group-hover/semester:text-gray-600"
             )}>
               <ChevronDown size={20} />
             </div>
           </div>
         </div>
       )}

       {variant === 'standalone' ? (
         <div className="pt-6">
           {content}
         </div>
       ) : (
         <div
           className={cn(
             "transition-all duration-300 ease-in-out",
             isOpen ? "opacity-100" : "opacity-0"
           )}
           style={{
             maxHeight: isOpen ? '5000px' : '0',
             overflow: isOpen && isFullyOpen ? 'visible' : 'hidden'
           }}
           onTransitionEnd={() => {
             if (isOpen) setIsFullyOpen(true);
             else setIsFullyOpen(false);
           }}
         >
           {content}
         </div>
       )}

       <ElectivePicker 
         isOpen={pickerOpen} 
         onClose={() => setPickerOpen(false)} 
         title={pickerTitle || ''}
         options={pickerOptions}
         excludedCodes={pickerExcludedCodes}
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
