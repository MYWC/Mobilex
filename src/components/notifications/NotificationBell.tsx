import { Bell, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '@/features/notifications/notification.store';
import { useAuthStore } from '@/stores/useAuthStore';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/ui/cn';

export function NotificationBell() {
  const user = useAuthStore((s) => s.appUser);
  const items = useNotificationStore((s) => s.items);
  const sync = useNotificationStore((s) => s.syncRemote);
  const markAll = useNotificationStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (user) void sync();
  }, [user, sync]);
  if (!user) return null;
  const unread = items.filter((x) => !x.read);
  return (
    <div className="mx-notification-wrap">
      <IconButton
        label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className={cn('mx-notification-trigger', open && 'is-open')}
      >
        <Bell size={17} />
        {unread.length > 0 && <Badge tone="danger">{unread.length > 99 ? '99+' : unread.length}</Badge>}
      </IconButton>
      {open && (
        <>
          <button className="mx-popover-backdrop" aria-label="close" onClick={() => setOpen(false)} />
          <div className="mx-notification-popover">
            <div className="mx-notification-head">
              <div>
                <strong>{'اعلان‌ها'}</strong>
                <span>
                  {unread.length} {'خوانده‌نشده'}
                </span>
              </div>
              <button type="button" onClick={() => void markAll()} aria-label="mark all">
                <CheckCheck size={15} />
              </button>
            </div>
            <div className="mx-notification-list">
              {items.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  to={item.href ?? '/notifications'}
                  onClick={() => setOpen(false)}
                  className={cn('mx-notification-item', !item.read && 'is-unread')}
                >
                  <span className={`mx-notification-dot ${item.tone}`} />
                  <div>
                    <strong>{item.title}</strong>
                    {item.body && <p>{item.body}</p>}
                    <time>
                      {new Date(item.createdAt).toLocaleString('fa-IR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </time>
                  </div>
                </Link>
              ))}
              {items.length === 0 && <div className="mx-notification-empty">اعلان جدیدی ندارید.</div>}
            </div>
            <Link to="/notifications" onClick={() => setOpen(false)} className="mx-notification-viewall">
              مشاهده همه اعلان‌ها
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
