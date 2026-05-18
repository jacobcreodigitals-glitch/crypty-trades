'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'default';
}

const badgeClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-white/5 text-slate-100',
  success: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20',
  warning: 'bg-yellow-400/10 text-yellow-300 ring-1 ring-yellow-400/20',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', badgeClasses[variant], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
