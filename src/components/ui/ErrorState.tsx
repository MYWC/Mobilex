import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ErrorState({ title = 'خطایی رخ داد', message = 'این بخش نتوانست با موفقیت اجرا شود.', onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <section className="state-card glass-panel" role="alert">
      <div className="state-icon danger"><AlertTriangle size={24} /></div>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>تلاش دوباره</Button>}
    </section>
  );
}
