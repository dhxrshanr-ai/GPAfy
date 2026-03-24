export function StickyResultBar({ sgpa }: { sgpa: number }) {
  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 glass-space bg-white/90 backdrop-blur-2xl border-emerald-200 p-5 rounded-[2.5rem] shadow-[0_4px_30px_rgba(5,150,105,0.15)] md:hidden animate-float transition-weightless">
      <div className="flex justify-center items-center max-w-3xl mx-auto px-4 gap-4">
        <span className="text-xs text-gray-500 font-space-grotesque font-black tracking-[0.3em] uppercase">Current GPA</span>
        <span className="text-2xl font-space-grotesque font-black tracking-tighter text-primary">
          {sgpa > 0 ? sgpa.toFixed(2) : '0.00'}
        </span>
      </div>
    </div>
  )
}
