import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, Syne } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-space-grotesque'
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-outfit'
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800']
});

export const metadata: Metadata = {
  title: 'GPAfy — Anna University GPA & CGPA',
  description: 'Unofficial AU GPA calculator with completely accurate grade tracking.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#F7F4F0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-[#F7F4F0] font-outfit antialiased pb-20 md:pb-0 overflow-x-hidden selection:bg-[#059669]/20",
        plusJakartaSans.variable,
        inter.variable,
        syne.variable
      )}>
        {/* Background — fixed, promoted to GPU layer */}
        <div className="fixed inset-0 z-[-1] pointer-events-none" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#d1fae5_0%,#F7F4F0_65%)] opacity-60" />
        </div>

        <header className="sticky top-0 z-[100] w-full bg-white/95 md:bg-white/90 border-b border-gray-200/80 shadow-sm md:backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <div className="py-5 px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="flex items-center gap-0 bg-gray-900 rounded-2xl px-4 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.25),0_0_20px_rgba(5,150,105,0.35)]">
                    <span style={{ fontFamily: 'var(--font-syne)' }} className="text-2xl font-extrabold tracking-tight text-white leading-none">
                      GPA
                    </span>
                    <span style={{ fontFamily: 'var(--font-syne)' }} className="text-2xl font-extrabold tracking-tight text-emerald-400 leading-none">
                      fy
                    </span>
                  </div>
                </div>
              </div>

            </div>
            <div className="bg-gradient-to-r from-transparent via-[#059669]/10 to-transparent text-[#059669] text-[9px] py-2 px-4 text-center font-space-grotesque font-black uppercase tracking-[0.5em] border-y border-emerald-100">
              • Precision GPA Calculator •
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
