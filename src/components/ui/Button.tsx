import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'outline' | 'glass';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconAfter?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', loading = false, icon, iconAfter,
  fullWidth = false, disabled, className, children, ...props
}: ButtonProps) {
  return (
    <button
      className={cn('mx-button', `mx-button-${variant}`, `mx-button-${size}`, fullWidth && 'mx-button-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="mx-button-spinner" aria-hidden="true" /> : icon}
      <span>{children}</span>
      {!loading && iconAfter}
    </button>
  );
}
