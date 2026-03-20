import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { hapticFeedback } from '@/utils/haptics';

interface FABProps {
  onClick: () => void;
  label?: string;
}

const FAB: React.FC<FABProps> = ({ onClick, label = 'Add' }) => {
  return (
    <motion.button
      onClick={() => {
        hapticFeedback('medium');
        onClick();
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.9, rotate: 5 }}
      whileHover={{ scale: 1.05 }}
      className="fixed bottom-20 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-2xl bg-gradient-to-tr from-primary to-secondary text-white"
      aria-label={label}
    >
      <Plus size={32} strokeWidth={2.5} />
      
      {/* Pulse effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-primary/40 -z-10"
      />
    </motion.button>
  );
};

export default FAB;
