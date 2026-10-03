import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & { interactive?: boolean; glass?: boolean; children: ReactNode };

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ interactive=false, glass=false, className, children, ...props }, ref) {
  return <div ref={ref} className={cn('mx-card', interactive && 'mx-card-interactive', glass && 'mx-glass', className)} {...props}>{children}</div>;
});
