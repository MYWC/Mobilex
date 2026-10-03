import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/ui/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('mx-skeleton', className)} {...props} />;
}

export function ProductSkeleton() {
  return (
    <div className="mx-skeleton-product" aria-hidden="true">
      <Skeleton className="ratio-product" />
      <Skeleton className="line w-35" />
      <Skeleton className="line w-75" />
      <Skeleton className="line w-55" />
      <div className="skeleton-row">
        <Skeleton className="line w-35" />
        <Skeleton className="pill-shape" />
      </div>
    </div>
  );
}
