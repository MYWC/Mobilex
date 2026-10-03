import type { ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
};

export function Badge({ children, tone = 'neutral', dot = false, pulse = false, className }: BadgeProps) {
  return (
    <span className={cn('mx-badge', `mx-badge-${tone}`, className)}>
      {dot && <span className={cn('mx-badge-dot', pulse && 'mx-badge-dot-pulse')} aria-hidden="true" />}
      {children}
    </span>
  );
}
