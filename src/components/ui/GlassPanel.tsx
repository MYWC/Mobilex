import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  intensity?: 'soft' | 'medium' | 'strong';
};

export function GlassPanel({ children, intensity = 'medium', className, ...props }: GlassPanelProps) {
  return (
    <div className={cn('mx-glass-panel', `mx-glass-${intensity}`, className)} {...props}>
      {children}
    </div>
  );
}
