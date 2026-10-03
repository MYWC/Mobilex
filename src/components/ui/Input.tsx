import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Input({ label, hint, error, leading, trailing, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label className="mx-field" htmlFor={inputId}>
      {label && <span className="mx-field-label">{label}</span>}
      <span className={cn('mx-input-shell', error && 'mx-input-error')}>
        {leading && <span className="mx-input-affix">{leading}</span>}
        <input
          id={inputId}
          className={cn(
            'mx-input',
            Boolean(leading) && 'has-leading',
            Boolean(trailing) && 'has-trailing',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {trailing && <span className="mx-input-affix">{trailing}</span>}
      </span>
      {(error || hint) && <span className={cn('mx-field-help', error && 'is-error')}>{error || hint}</span>}
    </label>
  );
}
