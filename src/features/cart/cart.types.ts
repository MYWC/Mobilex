export interface CartLine {
  cartKey: string;
  id: string;
  variantId?: string | null;
  variantLabel?: string;
  name_fa?: string;
  name_en?: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image?: string;
  maxQuantity?: number;
  metadata?: Record<string, unknown>;
}
export interface CartValidationIssue {
  cartKey: string;
  code: 'OUT_OF_STOCK' | 'LIMIT_EXCEEDED' | 'INACTIVE' | 'PRICE_CHANGED';
  message: string;
}
