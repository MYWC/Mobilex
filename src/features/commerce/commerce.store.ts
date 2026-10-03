import { create } from 'zustand';
import { z } from 'zod';
import { readStorage, writeStorage } from '@/lib/storage/storage';
import { COMMERCE, SHIPPING_OPTIONS } from './commerce.constants';
import { checkoutDraftSchema } from './commerce.schema';
import type { CheckoutDraft, CommerceAddress, CouponState, CheckoutStep, PaymentMethod, ShippingMethod } from './commerce.types';

interface CommerceState {
  step: CheckoutStep;
  address: CommerceAddress | null;
  addresses: CommerceAddress[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  coupon: CouponState | null;
  processing: boolean;
  error: string | null;
  hydrated: boolean;
  idempotencyKey: string;
  acceptedTerms: boolean;
  hydrate: () => void;
  setStep: (step: CheckoutStep) => void;
  setAddress: (address: CommerceAddress | null) => void;
  setAddresses: (addresses: CommerceAddress[]) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCoupon: (coupon: CouponState | null) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  refreshIdempotencyKey: () => void;
  reset: () => void;
}

const draftStateSchema = z.object({
  version: z.literal(2),
  step: z.enum(['review', 'address', 'shipping', 'payment', 'confirm']),
  address: z.any().nullable(),
  shippingMethod: z.enum(['standard', 'express', 'pickup']),
  paymentMethod: z.enum(['cod', 'online', 'wallet']),
  coupon: z.any().nullable(),
  idempotencyKey: z.string().uuid(),
  savedAt: z.string(),
});

function freshKey(): string {
  return crypto.randomUUID();
}

function persist(get: () => CommerceState): void {
  const state = get();
  const draft: CheckoutDraft = {
    version: 2,
    step: state.step,
    address: state.address,
    shippingMethod: state.shippingMethod,
    paymentMethod: state.paymentMethod,
    coupon: state.coupon,
    idempotencyKey: state.idempotencyKey,
    savedAt: new Date().toISOString(),
  };
  writeStorage(COMMERCE.checkoutDraftKey, draft);
}

export const useCommerceStore = create<CommerceState>((set, get) => ({
  step: 'review',
  address: null,
  addresses: [],
  shippingMethod: SHIPPING_OPTIONS[0].id,
  paymentMethod: 'online',
  coupon: null,
  processing: false,
  error: null,
  hydrated: false,
  idempotencyKey: freshKey(),
  acceptedTerms: false,

  hydrate: () => {
    const raw = readStorage(COMMERCE.checkoutDraftKey, null);
    const parsed = draftStateSchema.safeParse(raw);
    if (parsed.success) {
      const d = parsed.data;
      set({
        step: d.step,
        address: d.address as CommerceAddress | null,
        shippingMethod: d.shippingMethod,
        paymentMethod: d.paymentMethod,
        coupon: d.coupon as CouponState | null,
        idempotencyKey: d.idempotencyKey,
        hydrated: true,
      });
      return;
    }
    set({ hydrated: true, idempotencyKey: freshKey() });
    persist(get);
  },

  setStep: (step) => {
    set({ step });
    persist(get);
  },
  setAddress: (address) => {
    set({ address });
    persist(get);
  },
  setAddresses: (addresses) => set({ addresses }),
  setShippingMethod: (shippingMethod) => {
    set({ shippingMethod });
    persist(get);
  },
  setPaymentMethod: (paymentMethod) => {
    set({ paymentMethod });
    persist(get);
  },
  setCoupon: (coupon) => {
    set({ coupon });
    persist(get);
  },
  setProcessing: (processing) => set({ processing }),
  setError: (error) => set({ error }),
  setAcceptedTerms: (acceptedTerms) => set({ acceptedTerms }),
  refreshIdempotencyKey: () => {
    const idempotencyKey = freshKey();
    set({ idempotencyKey });
    persist(get);
  },
  reset: () => {
    localStorage.removeItem(COMMERCE.checkoutDraftKey);
    set({
      step: 'review',
      address: null,
      addresses: [],
      shippingMethod: SHIPPING_OPTIONS[0].id,
      paymentMethod: 'online',
      coupon: null,
      processing: false,
      error: null,
      hydrated: true,
      idempotencyKey: freshKey(),
      acceptedTerms: false,
    });
  },
}));
