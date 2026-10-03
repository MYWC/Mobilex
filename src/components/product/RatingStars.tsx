import { Star } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
export function RatingStars({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('mx-rating', className)} aria-label={`${value.toFixed(1)} / 5`}>
      <span className="mx-stars">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={13} fill="currentColor" className={i + 0.5 <= value ? 'is-filled' : ''} />
        ))}
      </span>
      <strong>{value.toFixed(1)}</strong>
      {count != null && <span className="mx-rating-count">({count})</span>}
    </div>
  );
}
