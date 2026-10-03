import { Flame, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
export function PromotionBadge({ label, hot = false }: { label: string; hot?: boolean }) {
  return (
    <Badge tone={hot ? 'danger' : 'primary'} dot>
      {hot ? <Flame size={11} /> : <Sparkles size={11} />} {label}
    </Badge>
  );
}
