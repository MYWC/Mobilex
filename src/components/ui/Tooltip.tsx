import type { ReactNode } from 'react';

type TooltipProps = { label: string; children: ReactNode };
export function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="mx-tooltip-wrap">
      <span tabIndex={0} className="mx-tooltip-trigger">
        {children}
      </span>
      <span className="mx-tooltip" role="tooltip">
        {label}
      </span>
    </span>
  );
}
