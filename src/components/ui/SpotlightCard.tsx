import { useRef, type PropsWithChildren, type MouseEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/ui/cn';

type SpotlightCardProps = PropsWithChildren<{ className?: string; intensity?: 'soft' | 'strong' }>;

export function SpotlightCard({ children, className, intensity = 'soft' }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    ref.current?.style.setProperty('--mx-pointer-x', `${event.clientX - rect.left}px`);
    ref.current?.style.setProperty('--mx-pointer-y', `${event.clientY - rect.top}px`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--mx-pointer-x', '50%');
    ref.current?.style.setProperty('--mx-pointer-y', '50%');
  };
  return (
    <Card
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('mx-spotlight-card', `mx-spotlight-${intensity}`, className)}
    >
      {children}
    </Card>
  );
}
