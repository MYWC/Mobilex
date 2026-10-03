import type { ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  tone?: 'neutral' | 'primary' | 'danger';
};
export function EmptyState({ icon, title, description, actions, tone = 'neutral' }: EmptyStateProps) {
  return (
    <div className={cn('mx-empty-state', `tone-${tone}`)}>
      <div className="mx-empty-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actions && <div className="mx-empty-actions">{actions}</div>}
    </div>
  );
}
