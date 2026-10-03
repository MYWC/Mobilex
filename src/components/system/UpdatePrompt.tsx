import { RefreshCw } from 'lucide-react';
import { usePwaStore } from '@/features/pwa/pwa.store';
import { Button } from '@/components/ui/Button';

export function UpdatePrompt() { const update = usePwaStore(s => s.updateAvailable); const apply = usePwaStore(s => s.applyUpdate); if (!update) return null; return <aside className="mx-update-prompt" role="status"><RefreshCw size={16}/><span>نسخه جدید Mobilex آماده است.</span><Button size="sm" onClick={apply}>به‌روزرسانی</Button></aside>; }
