import React from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { useGPAStore } from '@/store/useGPAStore';
import { Subject } from '@/types';
import { hapticFeedback } from '@/utils/haptics';

interface SubjectRowProps {
  semesterId: string;
  subject: Subject;
}

export const SubjectRow: React.FC<SubjectRowProps> = ({ semesterId, subject }) => {
  const { removeSubject, gradingScale } = useGPAStore();
  const controls = useAnimation();

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = -100; // Swipe left threshold
    if (info.offset.x < threshold) {
      hapticFeedback('heavy');
      await controls.start({ x: '-100%', opacity: 0 });
      removeSubject(semesterId, subject.id);
    } else {
      controls.start({ x: 0 });
    }
  };

  const maxPoints = Number(gradingScale);
  const progressPercent = (subject.gradeValue / maxPoints) * 100;

  return (
    <div className="relative mb-3 group overflow-hidden rounded-2xl">
      {/* Delete Action Background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6">
        <div className="flex flex-col items-center gap-1 text-white">
          <Trash2 size={24} />
          <span className="text-[10px] font-black uppercase">Delete</span>
        </div>
      </div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 0.98 }}
        className="relative bg-card border border-white/10 p-5 rounded-2xl flex items-center gap-4 active:border-primary/30 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                {subject.code || 'SUBJECT'}
              </div>
              <h3 className="text-base font-bold text-white line-clamp-1">
                {subject.name}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white italic leading-none">
                {subject.gradeLabel}
              </div>
              <div className="text-[10px] font-bold text-white/30 uppercase mt-1">
                {subject.credits} Credits
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="text-white/20 group-hover:text-white/40 transition-colors">
          <ChevronRight size={20} />
        </div>
      </motion.div>
    </div>
  );
};
