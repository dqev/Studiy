import * as React from 'react';
import { cn } from '@/src/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'text-slate-950 border border-slate-200',
    destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
    success: 'border-transparent bg-emerald-600 text-white hover:bg-emerald-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
