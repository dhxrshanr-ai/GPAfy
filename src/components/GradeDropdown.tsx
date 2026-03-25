import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

const VALID_GRADES = new Set(['O', 'A+', 'A', 'B+', 'B', 'C', 'RA']);

export function GradeDropdown({ value, onChange, id = 'default', onOpenChange }: { 
  value?: string, 
  onChange: (v: string) => void, 
  dropUp?: boolean, 
  id?: string,
  onOpenChange?: (open: boolean) => void
}) {
  const [inputVal, setInputVal] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value into local input state
  useEffect(() => {
    setInputVal(value || '');
  }, [value]);

  // Notify parent when focus state changes
  useEffect(() => {
    onOpenChange?.(isFocused);
  }, [isFocused, onOpenChange]);

  const commit = useCallback((raw: string) => {
    const upper = raw.trim().toUpperCase();
    if (VALID_GRADES.has(upper)) {
      onChange(upper);
      setInputVal(upper);
    } else if (upper === '') {
      onChange('');
      setInputVal('');
    } else {
      // Revert to last valid value
      setInputVal(value || '');
    }
  }, [onChange, value]);

  const isValid = VALID_GRADES.has(inputVal.trim().toUpperCase());
  const isEmpty = inputVal.trim() === '';
  const hasContent = inputVal.length > 0;

  return (
    <div className="relative shrink-0">
      <input
        ref={inputRef}
        id={`grade-input-${id}`}
        type="text"
        maxLength={2}
        value={inputVal}
        placeholder="GRADE"
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commit(inputVal);
        }}
        onChange={(e) => {
          const upper = e.target.value.toUpperCase();
          setInputVal(upper);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit(inputVal);
            inputRef.current?.blur();
          }
          if (e.key === 'Escape') {
            setInputVal(value || '');
            inputRef.current?.blur();
          }
        }}
        className={cn(
          "h-12 w-24 sm:w-28 px-3 rounded-2xl border-2 text-center font-space-grotesque font-black text-sm tracking-widest uppercase outline-none transition-all duration-200",
          isEmpty && !isFocused
            ? "bg-gray-50 border-gray-200 text-gray-400 placeholder:text-gray-300"
            : isFocused && !isValid && hasContent
            ? "bg-red-50 border-red-300 text-red-500 ring-2 ring-red-100"
            : isFocused
            ? "bg-emerald-50 border-primary text-gray-800 ring-2 ring-primary/15"
            : isValid
            ? "bg-primary border-primary text-white shadow-[0_4px_15px_rgba(5,150,105,0.25)]"
            : "bg-gray-50 border-gray-200 text-gray-400"
        )}
      />
    </div>
  );
}
