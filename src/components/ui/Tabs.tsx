import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';
export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}
export function Tabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(items.find((i) => !i.disabled)?.key || items[0]?.key);
  const current = items.find((i) => i.key === active) || items[0];
  return (
    <div className="mx-tabs">
      <div className="mx-tabs-list" role="tablist">
        {items.map((i) => (
          <button
            key={i.key}
            type="button"
            role="tab"
            aria-selected={i.key === active}
            disabled={i.disabled}
            className={cn('mx-tab', i.key === active && 'is-active')}
            onClick={() => setActive(i.key)}
          >
            {i.label}
          </button>
        ))}
      </div>
      <div className="mx-tab-panel" role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
