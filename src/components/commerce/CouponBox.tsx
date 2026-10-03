import { useEffect, useState } from 'react';
import { BadgePercent, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/stores/useAppStore';
import { validateCoupon } from '@/features/commerce/coupon.service';
import type { CouponState } from '@/features/commerce/commerce.types';

export function CouponBox({ subtotal, value, onChange }: { subtotal: number; value: CouponState | null; onChange: (value: CouponState | null) => void }) {
  const fa = useAppStore((state) => state.locale) === 'fa';
  const [code, setCode] = useState(value?.code ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCode(value?.code ?? '');
    if (value?.applied && value.validatedSubtotal !== subtotal) {
      onChange(null);
      setMessage(fa ? 'مبلغ سفارش تغییر کرده؛ کد تخفیف را دوباره اعمال کن.' : 'Your order total changed; please re-apply the coupon.');
    }
  }, [fa, onChange, subtotal, value?.applied, value?.code, value?.validatedSubtotal]);

  const apply = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await validateCoupon(code, subtotal);
      if (!result.valid) {
        onChange(null);
        setMessage(fa ? 'این کد برای سفارش فعلی قابل استفاده نیست.' : 'This code is not valid for the current order.');
        return;
      }
      onChange(result);
      setMessage(fa ? `کد با ${result.discount.toLocaleString('fa-IR')} تومان تخفیف اعمال شد.` : `Coupon applied: ${result.discount.toLocaleString()} تومان.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (fa ? 'خطا در اعتبارسنجی کد.' : 'Coupon validation failed.'));
    } finally {
      setLoading(false);
    }
  };

  return <div className="mx-coupon-box">
    <div className="mx-coupon-head"><span><BadgePercent size={16} />{fa ? 'کد تخفیف' : 'Coupon code'}</span>{value?.applied && <Badge tone="success" dot>{fa ? 'فعال' : 'Applied'}</Badge>}</div>
    <div className="mx-coupon-row"><Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="MOBILEX" disabled={loading} />{value?.applied ? <Button variant="outline" onClick={() => { onChange(null); setCode(''); setMessage(''); }} icon={<X size={15} />}>{fa ? 'حذف' : 'Remove'}</Button> : <Button disabled={!code.trim()} loading={loading} onClick={() => void apply()} icon={<Check size={15} />}>{fa ? 'اعمال' : 'Apply'}</Button>}</div>
    {message && <p className={`mx-coupon-message ${value?.applied ? 'success' : ''}`}><AlertTriangle size={13} />{message}</p>}
  </div>;
}
