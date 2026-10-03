import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { usePwaStore } from '@/features/pwa/pwa.store';
import { Button } from '@/components/ui/Button';

export function InstallPrompt() {
  const installable = usePwaStore((s) => s.installable);
  const promptInstall = usePwaStore((s) => s.promptInstall);
  const [hidden, setHidden] = useState(false);
  if (!installable || hidden) return null;
  return (
    <aside className="mx-pwa-prompt" aria-label="نصب Mobilex">
      <div className="mx-pwa-prompt-icon">
        <Download size={18} />
      </div>
      <div>
        <strong>Mobilex را نصب کن</strong>
        <p>دسترسی سریع‌تر و تجربه شبیه اپلیکیشن.</p>
      </div>
      <div className="mx-pwa-prompt-actions">
        <Button size="sm" onClick={() => void promptInstall()}>
          نصب
        </Button>
        <button className="mx-pwa-close" onClick={() => setHidden(true)} aria-label="بستن">
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}
