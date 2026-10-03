import type { ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type SectionHeadingProps = { eyebrow?: string; title: string; description?: string; actions?: ReactNode; align?: 'start' | 'center'; className?: string };
export function SectionHeading({ eyebrow, title, description, actions, align='start', className }: SectionHeadingProps) {
  return <div className={cn('mx-section-heading', `align-${align}`, className)}>
    <div><>{eyebrow && <span className="mx-eyebrow">{eyebrow}</span>}</><h2>{title}</h2>{description && <p>{description}</p>}</div>
    {actions && <div className="mx-section-actions">{actions}</div>}
  </div>;
}
