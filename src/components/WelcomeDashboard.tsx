import { motion } from 'framer-motion';
import { Calculator, LayoutList, BookOpen } from 'lucide-react';

interface WelcomeDashboardProps {
  onSelect: (mode: 'sgpa' | 'cgpa' | 'syllabus') => void;
}

export function WelcomeDashboard({ onSelect }: WelcomeDashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="glass-panel p-10 rounded-[3rem] depth-tilt mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <h1 className="text-4xl sm:text-5xl font-space-grotesque font-black tracking-tighter mb-4 text-gray-900">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">GPAfy</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-md">
          The ultimate weightless academic tool for Anna University students. Select what you&apos;d like to do today:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="GPA Calculator"
          description="Calculate your current semester GPA with our interactive point-and-click elective picker."
          icon={<Calculator className="w-8 h-8 text-primary" />}
          onClick={() => onSelect('sgpa')}
        />
        <DashboardCard 
          title="CGPA Calculator"
          description="Track your cumulative academic progress across multiple semesters with beautifully rendered charts."
          icon={<LayoutList className="w-8 h-8 text-emerald-500" />}
          onClick={() => onSelect('cgpa')}
        />
        <DashboardCard 
          title="Syllabus Explorer"
          description="Browse detailed 5-unit syllabus break-downs for your regulation, department, and subjects."
          icon={<BookOpen className="w-8 h-8 text-teal-500" />}
          onClick={() => onSelect('syllabus')}
        />
      </div>
    </motion.div>
  );
}

function DashboardCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-start gap-6 text-left relative overflow-hidden group transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(16,185,129,0.15)] bg-white/40"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10">
        {icon}
      </div>
      <div className="relative z-10">
        <h3 className="text-xl font-space-grotesque font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">{description}</p>
      </div>
    </motion.button>
  );
}
