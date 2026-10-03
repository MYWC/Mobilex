import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/ui/cn';

type DrawerProps = { open: boolean; onClose: () => void; title: string; children: ReactNode; side?: 'start' | 'end' };

export function Drawer({ open, onClose, title, children, side='end' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return <div className={cn('mx-drawer-backdrop', open && 'is-open')} aria-hidden={!open} onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}>
    <aside className={cn('mx-drawer', `mx-drawer-${side}`, open && 'is-open')} role="dialog" aria-modal="true" aria-label={title}>
      <header className="mx-drawer-header"><strong>{title}</strong><IconButton label="Close" onClick={onClose}><X size={18} /></IconButton></header>
      <div className="mx-drawer-body">{children}</div>
    </aside>
  </div>;
}
