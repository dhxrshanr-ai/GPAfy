import React, { useState } from 'react';
import { Trash2, AlertCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGPAStore } from '@/store/useGPAStore';
import { SubjectRow } from './SubjectRow';
import { hapticFeedback } from '@/utils/haptics';

interface SemesterSectionProps {
  semesterId: string;
  onAddSubject: (semesterId: string) => void;
}

export const SemesterSection: React.FC<SemesterSectionProps> = ({ semesterId, onAddSubject }) => {
  const { semesters, calculateGPA, removeSemester, setActiveSemester } = useGPAStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const semester = semesters.find(s => s.id === semesterId);
  if (!semester) return null;

  const gpa = calculateGPA(semesterId);
  const totalCredits = semester.subjects.reduce((sum, s) => sum + s.credits, 0);

  const toggleCollapse = () => {
    hapticFeedback('light');
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative">
      {/* Sticky Header */}
      <div className="sticky top-[-1px] z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-1 py-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-3" onClick={toggleCollapse}>
            <div className={`p-2 rounded-xl transition-all ${isCollapsed ? 'bg-white/5' : 'bg-primary/20'}`}>
              {isCollapsed ? <ChevronDown size={20} className="text-white/40" /> : <ChevronUp size={20} className="text-primary" />}
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tight text-white">{semester.name}</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {semester.subjects.length} Subjects • {totalCredits} Credits
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-right mr-2">
                <div className="text-2xl font-black text-primary italic leading-none">{gpa}</div>
                <div className="text-[9px] font-black text-white/20 uppercase mt-1">GPA</div>
             </div>
             
             <button 
              onClick={() => {
                hapticFeedback('error');
                if (confirm('Delete this semester?')) removeSemester(semesterId);
              }}
              className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pb-4">
              {semester.subjects.length > 0 ? (
                semester.subjects.map((subject) => (
                  <SubjectRow key={subject.id} semesterId={semesterId} subject={subject} />
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                  <AlertCircle size={40} className="mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs mb-6">No subjects yet</p>
                  <button
                    onClick={() => {
                      setActiveSemester(semesterId);
                      onAddSubject(semesterId);
                    }}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 font-bold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>Add Subject</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
