import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useGPAStore } from '../../store/useGPAStore';
import { GlassCard } from '../common/GlassCard';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { semesters, gradingScale, calculateGPA } = useGPAStore();

  const data = semesters
    .filter(s => s.subjects.length > 0)
    .map((s) => ({
      name: s.name,
      gpa: calculateGPA(s.id),
    }));

  const allSubjects = semesters.flatMap(s => s.subjects);
  
  // Grade distribution
  const gradeDist = allSubjects.reduce((acc: any, s) => {
    acc[s.gradeLabel] = (acc[s.gradeLabel] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(gradeDist).map(key => ({
    name: key,
    value: gradeDist[key]
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold">Academic Analytics</h2>
        <p className="text-white/50">Visualize your progress and identify performance patterns.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GPA Trend */}
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
               <TrendingUp size={20} className="text-primary" />
               GPA Trend Line
            </h3>
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Semester Performance</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, Number(gradingScale)]} 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 4, 8, 10]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a25', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorGpa)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Grade Distribution */}
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
               <PieIcon size={20} className="text-secondary" />
               Grade Distribution
            </h3>
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Subject Breakdown</div>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
             {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a25', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
               <div className="text-white/20 text-sm">Add subjects to see distribution</div>
             )}
          </div>
        </GlassCard>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
           <div className="text-xs font-bold text-white/40 uppercase mb-2">Total Subjects</div>
           <div className="text-3xl font-black">{allSubjects.length}</div>
        </GlassCard>
        <GlassCard className="p-6">
           <div className="text-xs font-bold text-white/40 uppercase mb-2">Total Credits</div>
           <div className="text-3xl font-black">{allSubjects.reduce((acc, s) => acc + s.credits, 0)}</div>
        </GlassCard>
        <GlassCard className="p-6">
           <div className="text-xs font-bold text-white/40 uppercase mb-2">Best Semester</div>
           <div className="text-3xl font-black">{data.length > 0 ? Math.max(...data.map(d => d.gpa)) : 0}</div>
        </GlassCard>
        <GlassCard className="p-6">
           <div className="text-xs font-bold text-white/40 uppercase mb-2">Predicted Path</div>
           <div className="text-3xl font-black text-primary">Stable</div>
        </GlassCard>
      </div>
    </div>
  );
};
