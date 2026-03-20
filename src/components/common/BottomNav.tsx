import React from 'react';
import { Calculator, TrendingUp, Target, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'gpa', icon: Calculator, label: 'GPA' },
    { id: 'cgpa', icon: TrendingUp, label: 'CGPA' },
    { id: 'target', icon: Target, label: 'Target' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200"
            >
              <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/20 scale-110' : ''}`}>
                <Icon
                  size={24}
                  className={`${isActive ? 'text-primary' : 'text-gray-500'}`}
                />
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
