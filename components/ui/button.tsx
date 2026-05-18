'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:from-emerald-400 hover:to-cyan-400',
  ghost: 'bg-transparent border border-white/10 text-white hover:bg-white/5',
  outline: 'bg-transparent border border-white/10 text-white hover:bg-white/5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', type = 'button', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-70',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-current border-t-transparent text-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
