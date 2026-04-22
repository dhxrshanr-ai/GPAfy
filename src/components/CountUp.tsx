"use client";

import { useEffect, useState } from "react";

export function CountUp({ value, duration = 1000, decimals = 2 }: { value: number, duration?: number, decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = progress * (value - startValue) + startValue;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{displayValue.toFixed(decimals)}</span>;
}
