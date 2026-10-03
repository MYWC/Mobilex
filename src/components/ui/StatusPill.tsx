import type { ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

export function StatusPill({ children, tone='neutral', dot=true }: { children: ReactNode; tone?: 'success'|'warning'|'danger'|'info'|'neutral'; dot?: boolean }) {
  return <span className={cn('mx-status-pill', `tone-${tone}`)}>{dot && <i aria-hidden="true" />}{children}</span>;
}
