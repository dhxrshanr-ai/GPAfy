export type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'error';

/**
 * Utility for mobile haptic feedback (Vibration API)
 */
export const hapticFeedback = (intensity: HapticIntensity = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns: Record<HapticIntensity, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      error: [20, 100, 20]
    };
    
    try {
      navigator.vibrate(patterns[intensity]);
    } catch (e) {
      console.warn('Haptic feedback failed', e);
    }
  }
};
