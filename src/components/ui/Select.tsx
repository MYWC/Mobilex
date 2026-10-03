import { useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; hint?: string };

export function Select({ label, error, hint, className, id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <label className="mx-field" htmlFor={selectId}>
      {label && <span className="mx-field-label">{label}</span>}
      <span className={cn('mx-select-shell', error && 'mx-input-error')}>
        <select id={selectId} className={cn('mx-select', className)} aria-invalid={Boolean(error)} {...props}>{children}</select>
        <ChevronDown className="mx-select-arrow" aria-hidden="true" />
      </span>
      {(error || hint) && <span className={cn('mx-field-help', error && 'is-error')}>{error || hint}</span>}
    </label>
  );
}
