import type { OrderSnapshot, OrderStatus, PaymentStatus } from '@/features/commerce/commerce.types';

export interface OrderListItem {
  id:string;
  orderNumber:string;
  status:OrderStatus;
  paymentStatus:PaymentStatus;
  totalAmount:number;
  itemCount:number;
  createdAt:string;
  updatedAt:string;
  shippingMethod:string;
  paymentMethod:string;
}
export interface OrderEventItem { id:string; orderId:string; eventType:string; message?:string; createdAt:string; metadata?:Record<string,unknown>; }
export interface OrdersPageResult { items:OrderListItem[]; total:number; page:number; pageSize:number; }
export interface OrderDetailResult { order:OrderSnapshot; events:OrderEventItem[]; }
