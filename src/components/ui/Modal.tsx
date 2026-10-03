import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/ui/cn';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, description, children, footer, size='md' }: ModalProps) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [open, onClose]);

  if (!open) return null;
  return <div className="mx-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}>
    <section className={cn('mx-modal', `mx-modal-${size}`)} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="mx-modal-header">
        <div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div>
        <IconButton label="Close" onClick={onClose}><X size={18} /></IconButton>
      </header>
      <div className="mx-modal-body">{children}</div>
      {footer && <footer className="mx-modal-footer">{footer}</footer>}
    </section>
  </div>;
}
