import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Plus, RefreshCw, ShieldCheck, ShoppingCart, WifiOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckoutStepper } from '@/components/commerce/CheckoutStepper';
import { AddressCard } from '@/components/commerce/AddressCard';
import { AddressForm } from '@/components/commerce/AddressForm';
import { ShippingOptions } from '@/components/commerce/ShippingOptions';
import { PaymentOptions } from '@/components/commerce/PaymentOptions';
import { CouponBox } from '@/components/commerce/CouponBox';
import { OrderSummary } from '@/components/commerce/OrderSummary';
import { useAppStore } from '@/stores/useAppStore';
import { useCartStore } from '@/features/cart/cart.store';
import { useCommerceStore } from '@/features/commerce/commerce.store';
import { buildCheckoutSnapshot, createOrder } from '@/features/commerce/order.service';
import { validateInventory } from '@/features/commerce/inventory.service';
import { loadAddresses, upsertAddress } from '@/features/commerce/address.service';
import { formatCurrency } from '@/lib/format/number';
import type { CommerceAddress, CheckoutStep } from '@/features/commerce/commerce.types';
import { useRuntimeStore } from '@/stores/useRuntimeStore';

const previous: Record<CheckoutStep, CheckoutStep> = {
  review: 'review', address: 'review', shipping: 'address', payment: 'shipping', confirm: 'payment',
};

export function CheckoutPage() {
  const locale = useAppStore((state) => state.locale);
  const fa = locale === 'fa';
  const online = useRuntimeStore((state) => state.online);
  const all = useCartStore((state) => state.items);
  const selected = useCartStore((state) => state.selected);
  const issues = useCartStore((state) => state.issues);
  const setIssues = useCartStore((state) => state.setIssues);
  const remove = useCartStore((state) => state.remove);

  const step = useCommerceStore((state) => state.step);
  const address = useCommerceStore((state) => state.address);
  const addresses = useCommerceStore((state) => state.addresses);
  const shipping = useCommerceStore((state) => state.shippingMethod);
  const payment = useCommerceStore((state) => state.paymentMethod);
  const coupon = useCommerceStore((state) => state.coupon);
  const processing = useCommerceStore((state) => state.processing);
  const error = useCommerceStore((state) => state.error);
  const acceptedTerms = useCommerceStore((state) => state.acceptedTerms);
  const idempotencyKey = useCommerceStore((state) => state.idempotencyKey);
  const setStep = useCommerceStore((state) => state.setStep);
  const setAddress = useCommerceStore((state) => state.setAddress);
  const setAddresses = useCommerceStore((state) => state.setAddresses);
  const setShipping = useCommerceStore((state) => state.setShippingMethod);
  const setPayment = useCommerceStore((state) => state.setPaymentMethod);
  const setCoupon = useCommerceStore((state) => state.setCoupon);
  const setProcessing = useCommerceStore((state) => state.setProcessing);
  const setError = useCommerceStore((state) => state.setError);
  const setAcceptedTerms = useCommerceStore((state) => state.setAcceptedTerms);
  const hydrate = useCommerceStore((state) => state.hydrate);
  const reset = useCommerceStore((state) => state.reset);

  const [edit, setEdit] = useState<CommerceAddress | 'new' | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ orderId: string; orderNumber: string; redirectUrl?: string } | null>(null);
  const navigate = useNavigate();

  const items = useMemo(() => all.filter((item) => selected.includes(item.cartKey)), [all, selected]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  useEffect(() => hydrate(), [hydrate]);
  useEffect(() => {
    let active = true;
    void loadAddresses().then((list) => {
      if (!active) return;
      setAddresses(list);
      if (!address) {
        const defaultAddress = list.find((item) => item.isDefault) ?? list[0];
        if (defaultAddress) setAddress(defaultAddress);
      }
    });
    return () => { active = false; };
  }, [setAddress, setAddresses, address?.id]);

  if (!items.length) {
    return <div className="mx-page"><div className="mx-shell mx-empty-checkout">
      <Badge tone="warning">CHECKOUT</Badge>
      <h1>{fa ? 'سبد انتخابی خالی است.' : 'No selected items.'}</h1>
      <p>{fa ? 'به سبد برگرد و کالاهای موردنظر را انتخاب کن.' : 'Return to cart and select items to continue.'}</p>
      <Link to="/cart"><Button icon={<ShoppingCart size={16} />}>{fa ? 'بازگشت به سبد' : 'Back to cart'}</Button></Link>
    </div></div>;
  }

  if (result) {
    return <div className="mx-page"><div className="mx-shell mx-order-success-page">
      <div className="mx-order-success-icon"><Check size={34} /></div>
      <Badge tone="success" dot>{fa ? 'سفارش ثبت شد' : 'Order created'}</Badge>
      <h1>{fa ? 'سفارش تو با موفقیت ایجاد شد.' : 'Your order has been created.'}</h1>
      <p>{fa ? `شماره سفارش: ${result.orderNumber}` : `Order number: ${result.orderNumber}`}</p>
      <div className="mx-order-success-actions">
        {result.redirectUrl ? <Button size="lg" onClick={() => { window.location.href = result.redirectUrl!; }} icon={<ShieldCheck size={16} />}>{fa ? 'ادامه پرداخت' : 'Continue payment'}</Button> : null}
        <Button size="lg" variant={result.redirectUrl ? 'outline' : 'primary'} onClick={() => navigate(`/orders/${result.orderId}`)} icon={<ShieldCheck size={16} />}>{fa ? 'پیگیری سفارش' : 'Track order'}</Button>
        <Link to="/products"><Button size="lg" variant="outline">{fa ? 'ادامه خرید' : 'Continue shopping'}</Button></Link>
      </div>
    </div></div>;
  }

  const next = async () => {
    setError(null);
    if (step === 'review') return setStep('address');
    if (step === 'address') {
      if (!address) return setError(fa ? 'یک آدرس انتخاب کن.' : 'Select an address.');
      return setStep('shipping');
    }
    if (step === 'shipping') return setStep('payment');
    if (step === 'payment') return setStep('confirm');

    if (!acceptedTerms) return setError(fa ? 'تأیید شرایط خرید لازم است.' : 'Accept the purchase confirmation.');
    if (payment === 'online' && !online) return setError(fa ? 'اینترنت برای پرداخت آنلاین لازم است.' : 'Internet is required for online payment.');

    setProcessing(true);
    setChecking(true);
    try {
      const inventory = await validateInventory(items);
      if (!inventory.ok) {
        setIssues(inventory.items.map((item) => ({
          cartKey: item.cartKey,
          code: item.priceChanged ? 'PRICE_CHANGED' : item.available <= 0 ? 'OUT_OF_STOCK' : item.requested > item.available ? 'LIMIT_EXCEEDED' : 'INACTIVE',
          message: item.priceChanged ? (fa ? 'قیمت این کالا تغییر کرده است.' : 'The price of this item changed.') : (fa ? `وضعیت موجودی ${item.productId} نیاز به بررسی دارد.` : `Inventory for ${item.productId} needs attention.`),
        })));
        throw new Error(inventory.errors.join(' • '));
      }
      setIssues([]);
      const snapshot = await buildCheckoutSnapshot({
        items,
        address,
        shippingMethod: shipping,
        paymentMethod: payment,
        coupon: coupon?.applied && coupon.validatedSubtotal === subtotal ? { code: coupon.code, discount: coupon.discount } : null,
        idempotencyKey,
      });
      const created = await createOrder(snapshot);
      items.forEach((item) => remove(item.cartKey));
      reset();
      if (created.redirectUrl) {
        setResult({ orderId: created.orderId, orderNumber: created.orderNumber, redirectUrl: created.redirectUrl });
      } else {
        setResult({ orderId: created.orderId, orderNumber: created.orderNumber });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (fa ? 'ثبت سفارش ناموفق بود.' : 'Order creation failed.'));
    } finally {
      setChecking(false);
      setProcessing(false);
    }
  };

  return <div className="mx-page mx-checkout-page"><div className="mx-shell">
    <div className="mx-breadcrumb"><Link to="/">{fa ? 'خانه' : 'Home'}</Link><span>›</span><Link to="/cart">{fa ? 'سبد' : 'Cart'}</Link><span>›</span><strong>{fa ? 'تکمیل سفارش' : 'Checkout'}</strong></div>
    <div className="mx-commerce-head">
      <div><Badge tone="primary" dot>SECURE CHECKOUT</Badge><h1>{fa ? 'تکمیل سفارش' : 'Complete your order'}</h1><p>{fa ? 'قیمت و موجودی در نقطه ایجاد سفارش دوباره سمت سرور کنترل می‌شوند.' : 'Price and inventory are revalidated server-side when the order is created.'}</p></div>
      <div className="mx-checkout-lock"><LockKeyhole size={15} />{online ? (fa ? 'نشست امن' : 'Secure session') : <><WifiOff size={14} />{fa ? 'آفلاین' : 'Offline'}</>}</div>
    </div>
    <CheckoutStepper current={step} />
    {(error || issues.length > 0) && <Card className="mx-form-error-card"><RefreshCw size={15} /><span>{error || issues.map((item) => item.message).join(' • ')}</span></Card>}

    <div className="mx-commerce-layout">
      <section className="mx-checkout-main">
        {step === 'review' && <Card className="mx-checkout-block"><div className="mx-checkout-block-head"><div><div className="mx-section-kicker"><ShoppingCart size={13} />REVIEW</div><h2>{fa ? 'کالاهای انتخاب‌شده' : 'Selected items'}</h2></div><Link to="/cart"><Button size="sm" variant="outline">{fa ? 'ویرایش سبد' : 'Edit cart'}</Button></Link></div><div className="mx-checkout-items">{items.map((item) => <div className="mx-checkout-item" key={item.cartKey}><div className="mx-checkout-thumb">{item.image && <img src={item.image} alt="" />}</div><div><strong>{fa ? item.name_fa || item.name_en : item.name_en || item.name_fa}</strong><small>{item.variantLabel || (fa ? 'استاندارد' : 'Standard')} · ×{item.quantity}</small></div><strong>{formatCurrency(item.price * item.quantity, locale)}</strong></div>)}</div></Card>}

        {step === 'address' && <><Card className="mx-checkout-block"><div className="mx-checkout-block-head"><div><div className="mx-section-kicker">ADDRESS</div><h2>{fa ? 'آدرس دریافت' : 'Delivery address'}</h2></div></div>{addresses.length > 0 && <div className="mx-address-list">{addresses.map((item) => <AddressCard key={item.id} address={item} selected={address?.id === item.id} onSelect={() => setAddress(item)} onEdit={() => setEdit(item)} />)}</div>}<button className="mx-add-address-card" type="button" onClick={() => setEdit('new')}><span className="mx-add-address-icon"><Plus size={18} /></span><span><strong>{fa ? 'افزودن آدرس جدید' : 'Add new address'}</strong><small>{fa ? 'برای این سفارش یک مقصد دقیق ثبت کن.' : 'Save a precise destination for this order.'}</small></span></button></Card>{edit && <AddressForm value={edit === 'new' ? null : edit} onSave={async (savedAddress) => { const saved = await upsertAddress(savedAddress); const next = [...addresses.filter((item) => item.id !== saved.id), saved]; setAddresses(next); setAddress(saved); setEdit(null); }} onCancel={() => setEdit(null)} />}</>}

        {step === 'shipping' && <Card className="mx-checkout-block"><div className="mx-checkout-block-head"><div><div className="mx-section-kicker">DELIVERY</div><h2>{fa ? 'روش ارسال' : 'Shipping method'}</h2></div></div><ShippingOptions value={shipping} onChange={setShipping} subtotal={subtotal} /></Card>}

        {step === 'payment' && <Card className="mx-checkout-block"><div className="mx-checkout-block-head"><div><div className="mx-section-kicker">PAYMENT</div><h2>{fa ? 'روش پرداخت' : 'Payment method'}</h2></div></div><PaymentOptions value={payment} onChange={setPayment} /><div className="mx-payment-note"><ShieldCheck size={15} />{fa ? 'اطلاعات حساس کارت در Mobilex ذخیره نمی‌شود؛ درگاه واقعی از طریق Edge Function/Adapter متصل می‌شود.' : 'Card data is not stored by Mobilex; a real gateway should be connected through an Edge Function/Adapter.'}</div></Card>}

        {step === 'confirm' && <Card className="mx-checkout-block"><div className="mx-checkout-block-head"><div><div className="mx-section-kicker">FINAL CHECK</div><h2>{fa ? 'آخرین بررسی' : 'Final review'}</h2></div></div><div className="mx-confirm-grid"><div><span>{fa ? 'گیرنده' : 'Recipient'}</span><strong>{address?.recipientName}</strong><p>{address?.city}، {address?.addressLine}</p></div><div><span>{fa ? 'ارسال' : 'Shipping'}</span><strong>{shipping}</strong><p>{fa ? 'روش انتخابی' : 'Selected method'}</p></div><div><span>{fa ? 'پرداخت' : 'Payment'}</span><strong>{payment}</strong><p>{fa ? 'روش انتخابی' : 'Selected method'}</p></div></div><label className="mx-check-row"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /><span>{fa ? 'صحت اطلاعات سفارش و شرایط خرید را تأیید می‌کنم.' : 'I confirm the order information and purchase terms.'}</span></label></Card>}

        <div className="mx-checkout-nav">{step !== 'review' && <Button variant="outline" onClick={() => setStep(previous[step])} icon={fa ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}>{fa ? 'مرحله قبل' : 'Back'}</Button>}<Button size="lg" loading={processing || checking} onClick={() => void next()} icon={step === 'confirm' ? <Check size={16} /> : undefined} iconAfter={step !== 'confirm' ? (fa ? <ArrowLeft size={16} /> : <ArrowRight size={16} />) : undefined}>{step === 'confirm' ? (fa ? 'ثبت سفارش' : 'Place order') : (fa ? 'ادامه' : 'Continue')}</Button></div>
      </section>
      <aside className="mx-order-summary"><CouponBox subtotal={subtotal} value={coupon} onChange={setCoupon} /><OrderSummary items={items} shippingMethod={shipping} coupon={coupon} /></aside>
    </div>
  </div></div>;
}
