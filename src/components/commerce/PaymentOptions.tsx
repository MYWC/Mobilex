import { Banknote, CheckCircle2, CreditCard, WalletCards } from 'lucide-react';
import type { PaymentMethod } from '@/features/commerce/commerce.types';
import { useAppStore } from '@/stores/useAppStore';

const methods = [
  { id: 'online' as const, icon: CreditCard, fa: 'پرداخت آنلاین', en: 'Online payment', nf: 'انتقال امن به درگاه پس از ثبت سفارش', ne: 'Redirect to the configured payment gateway after order creation', disabled: false },
  { id: 'cod' as const, icon: Banknote, fa: 'پرداخت هنگام تحویل', en: 'Cash on delivery', nf: 'طبق سیاست ارسال و فروشگاه', ne: 'Subject to the store delivery policy', disabled: false },
  { id: 'wallet' as const, icon: WalletCards, fa: 'کیف پول', en: 'Store wallet', nf: 'در نسخه فعلی فعال نیست', ne: 'Not activated in the current commerce schema', disabled: true },
];

export function PaymentOptions({ value, onChange }: { value: PaymentMethod; onChange: (value: PaymentMethod) => void }) {
  const fa = useAppStore((state) => state.locale) === 'fa';
  return <div className="mx-payment-options">
    {methods.map((method) => {
      const Icon = method.icon;
      const selected = method.id === value;
      return <button
        key={method.id}
        className={`mx-payment-option ${selected ? 'is-selected' : ''} ${method.disabled ? 'is-disabled' : ''}`}
        type="button"
        disabled={method.disabled}
        onClick={() => onChange(method.id)}
        aria-disabled={method.disabled}
      >
        <span className="mx-payment-option-icon"><Icon size={18} /></span>
        <span className="mx-payment-option-copy"><strong>{fa ? method.fa : method.en}</strong><small>{fa ? method.nf : method.ne}</small></span>
        {selected && !method.disabled ? <CheckCircle2 size={19} /> : null}
      </button>;
    })}
  </div>;
}
