import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-card border-t border-white/10 rounded-t-[32px] max-h-[90vh] overflow-y-auto px-6 pb-12 pt-4 shadow-2xl"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" onClick={onClose} />
            
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black italic tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            
            <div className="space-y-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
