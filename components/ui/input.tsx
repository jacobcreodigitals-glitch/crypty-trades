'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder:text-slate-500',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
