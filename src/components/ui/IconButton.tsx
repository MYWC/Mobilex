import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: 'solid' | 'ghost' | 'soft' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
};

export function IconButton({ label, variant='ghost', size='md', className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('mx-icon-button', `mx-icon-button-${variant}`, `mx-icon-button-${size}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
