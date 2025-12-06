"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function CodeInput({
  length = 6,
  value,
  onChange,
  className,
  disabled = false,
  autoFocus = false
}: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow numbers
    if (inputValue !== '' && !/^\d$/.test(inputValue)) {
      return;
    }

    const newValue = value.split('');
    newValue[index] = inputValue;

    // Fill array to correct length
    while (newValue.length < length) {
      newValue.push('');
    }

    const result = newValue.slice(0, length).join('');
    onChange(result);

    // Move to next input if current is filled
    if (inputValue !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      const newValue = value.split('');

      if (newValue[index]) {
        // Clear current cell
        newValue[index] = '';
      } else if (index > 0) {
        // Move to previous cell and clear it
        newValue[index - 1] = '';
        inputRefs.current[index - 1]?.focus();
      }

      const result = newValue.slice(0, length).join('');
      onChange(result);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, length);
    onChange(numbers);

    // Focus the next empty input or last input
    const nextIndex = Math.min(numbers.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const digits = value.padEnd(length, '').slice(0, length).split('');

  return (
    <div className={cn("flex gap-2", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-mono border-2 rounded-lg transition-all",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            digit ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white",
            focusedIndex === index ? "ring-2 ring-blue-500 border-transparent" : "",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-text",
            "hover:border-blue-400"
          )}
        />
      ))}
    </div>
  );
}