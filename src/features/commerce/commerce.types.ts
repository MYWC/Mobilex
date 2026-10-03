import type { CartLine } from '@/features/cart/cart.types';

export type CheckoutStep = 'review' | 'address' | 'shipping' | 'payment' | 'confirm';
export type PaymentMethod = 'cod' | 'online' | 'wallet';
export type ShippingMethod = 'standard' | 'express' | 'pickup';
export type OrderStatus = 'processing' | 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'unpaid' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface CommerceAddress {
  id?: string;
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  plaque?: string;
  unit?: string;
  notes?: string;
  isDefault?: boolean;
}

export interface ShippingOption {
  id: ShippingMethod;
  title: string;
  description: string;
  price: number;
  etaMinDays: number;
  etaMaxDays: number;
  freeThreshold?: number;
  icon: 'truck' | 'zap' | 'store';
}

export interface CouponState {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  description?: string;
  applied: boolean;
  validatedSubtotal: number;
  validatedAt: string;
}

export interface CartPricing {
  itemsSubtotal: number;
  itemDiscount: number;
  couponDiscount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  payableTotal: number;
  savings: number;
}

export interface CheckoutSnapshot {
  items: CartLine[];
  address: CommerceAddress | null;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  pricing: CartPricing;
  idempotencyKey: string;
}

export interface InventoryValidationItem {
  cartKey: string;
  productId: string;
  variantId?: string | null;
  requested: number;
  available: number;
  unitPrice: number;
  isActive: boolean;
  priceChanged?: boolean;
}

export interface InventoryValidationResult {
  ok: boolean;
  items: InventoryValidationItem[];
  errors: string[];
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentRequired: boolean;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  redirectUrl?: string;
  paymentId?: string;
  idempotent?: boolean;
  reservationExpiresAt?: string;
}

export interface CheckoutDraft {
  version: 2;
  step: CheckoutStep;
  address: CommerceAddress | null;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  coupon: CouponState | null;
  idempotencyKey: string;
  savedAt: string;
}

export interface OrderItemSnapshot {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantLabel?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number;
  lineTotal: number;
}

export interface OrderSnapshot {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  plaque?: string;
  unit?: string;
  notes?: string;
  subtotal: number;
  itemDiscount: number;
  couponDiscount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemSnapshot[];
}
