import { useEffect, useMemo, useState } from 'react';
import type { ProductVariant } from '@/types/catalog';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/ui/cn';
export function VariantSelector({
  variants,
  onChange,
  locale = 'fa',
}: {
  variants: ProductVariant[];
  onChange: (variant: ProductVariant) => void;
  locale?: 'fa' | 'en';
}) {
  const initial = useMemo(
    () =>
      variants.find((v) => v.isDefault && v.stock > 0) || variants.find((v) => v.stock > 0) || variants[0],
    [variants],
  );
  const [selected, setSelected] = useState(initial?.id);
  useEffect(() => {
    if (initial) onChange(initial);
  }, [initial, onChange]);
  if (!variants.length) return null;
  return (
    <div className="mx-variant-selector">
      <div className="mx-variant-head">
        <strong>{locale === 'fa' ? 'انتخاب مدل' : 'Choose variant'}</strong>
        <span>
          {variants.filter((v) => v.stock > 0).length} / {variants.length}
        </span>
      </div>
      <div className="mx-variant-grid">
        {variants.map((v) => {
          const active = v.id === selected;
          return (
            <button
              key={v.id}
              type="button"
              disabled={v.stock <= 0}
              className={cn('mx-variant-option', active && 'is-active', v.stock <= 0 && 'is-disabled')}
              onClick={() => {
                setSelected(v.id);
                onChange(v);
              }}
            >
              <span>
                {v.label || [v.color, v.storage, v.ram].filter(Boolean).join(' · ') || v.sku || v.id}
              </span>
              {v.stock > 0 ? (
                <Badge tone={v.stock <= 3 ? 'warning' : 'success'}>
                  {v.stock <= 3
                    ? locale === 'fa'
                      ? 'محدود'
                      : 'Low stock'
                    : locale === 'fa'
                      ? 'موجود'
                      : 'In stock'}
                </Badge>
              ) : (
                <Badge tone="danger">{locale === 'fa' ? 'ناموجود' : 'Sold out'}</Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
