import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, HelpCircle, Activity } from 'lucide-react';
import { useGPAStore } from '../../store/useGPAStore';
import { GlassCard } from '../common/GlassCard';

export const TargetGPACalculator: React.FC = () => {
  const { calculateCGPA, semesters, gradingScale } = useGPAStore();
  const currentCGPA = calculateCGPA();
  const totalCredits = semesters.flatMap(s => s.subjects).reduce((acc, s) => acc + s.credits, 0);
  
  const [targetGPA, setTargetGPA] = useState<number | ''>('');
  const [remainingCredits, setRemainingCredits] = useState<number | ''>('');

  const calculateRequiredGPA = () => {
    if (targetGPA === '' || remainingCredits === '' || remainingCredits <= 0) return null;
    
    // Formula: (CurrentCredits * CurrentGPA + RemainingCredits * RequiredGPA) / TotalPossibleCredits = TargetGPA
    // RequiredGPA = (TargetGPA * (TotalPossibleCredits) - CurrentCredits * CurrentGPA) / RemainingCredits
    
    const target = Number(targetGPA);
    const remaining = Number(remainingCredits);
    const totalPossibleCredits = totalCredits + remaining;
    
    const requiredTotalPoints = target * totalPossibleCredits;
    const currentTotalPoints = currentCGPA * totalCredits;
    
    const requiredGPA = (requiredTotalPoints - currentTotalPoints) / remaining;
    return Number(requiredGPA.toFixed(2));
  };

  const status = calculateRequiredGPA();
  const maxGPA = Number(gradingScale);

  const getFeasibility = (val: number) => {
    if (val <= maxGPA * 0.75) return { label: 'Realistic', color: 'text-green-400', bg: 'bg-green-400/10' };
    if (val <= maxGPA * 0.9) return { label: 'Challenging', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    if (val <= maxGPA) return { label: 'Extremely Hard', color: 'text-orange-400', bg: 'bg-orange-400/10' };
    return { label: 'Mathematically Impossible', color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <section>
        <h2 className="text-3xl font-bold">Goal System</h2>
        <p className="text-white/50">Plan your path to academic excellence with smart projections.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-8 space-y-6 flex flex-col justify-center">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2">Target Cumulative GPA</label>
              <input 
                type="number" 
                step="0.1"
                max={maxGPA}
                value={targetGPA}
                onChange={(e) => setTargetGPA(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`Target (e.g. ${maxGPA * 0.85})`}
                className="w-full glass-input text-2xl font-bold py-4"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2">Remaining Credits</label>
              <input 
                type="number" 
                value={remainingCredits}
                onChange={(e) => setRemainingCredits(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Credits left to complete"
                className="w-full glass-input text-2xl font-bold py-4"
              />
            </div>
          </div>
        </GlassCard>

        {status !== null ? (
          <GlassCard className={`p-8 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden ${getFeasibility(status).bg}`}>
             <div className="absolute top-4 right-4 opacity-10">
                <Target size={120} />
             </div>
             <div>
                <p className="text-white/60 font-medium mb-1">Required GPA for remaining courses:</p>
                <div className="text-7xl font-black text-white">{status}</div>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md">
                   <Activity className={getFeasibility(status).color} size={18} />
                   <span className={`text-sm font-bold uppercase tracking-widest ${getFeasibility(status).color}`}>
                      {getFeasibility(status).label}
                   </span>
                </div>
             </div>
             
             <div className="w-full space-y-2 pt-6">
                <div className="flex justify-between text-xs font-bold text-white/40">
                  <span>Progress</span>
                  <span>{((currentCGPA / status) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ${status > maxGPA ? 'bg-red-500' : 'bg-primary'}`}
                     style={{ width: `${Math.min((currentCGPA / status) * 100, 100)}%` }}
                   />
                </div>
             </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-8 flex flex-col justify-center items-center text-center border-dashed border-white/10 opacity-50">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <HelpCircle size={32} />
             </div>
             <p className="font-medium">Enter your target and remaining credits to see required grades</p>
          </GlassCard>
        )}
      </div>

      <GlassCard className="p-6">
         <h4 className="font-bold flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-primary" />
            Smart Recommendations
         </h4>
         <div className="space-y-4">
            {status !== null && status <= maxGPA ? (
              <p className="text-white/60 text-sm leading-relaxed">
                To achieve your goal of <span className="text-white font-bold">{targetGPA}</span>, you need to average a 
                <span className="text-primary font-bold mx-1">{status}</span> in your remaining 
                <span className="text-white font-bold"> {remainingCredits}</span> credits. 
                Focus on high-credit courses as they weigh more on your cumulative average.
              </p>
            ) : status !== null ? (
              <div className="flex gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertTriangle size={20} className="shrink-0" />
                <p className="text-sm">
                  Your target GPA is currently mathematically impossible with the remaining credits. 
                  Try lowering your target or adding more future semesters to dilute the weight.
                </p>
              </div>
            ) : (
              <p className="text-white/40 text-sm">Fill in the fields above to get personalized academic advice.</p>
            )}
         </div>
      </GlassCard>
    </div>
  );
};
