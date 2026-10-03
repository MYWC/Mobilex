export type AdminOrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';
export type AdminPaymentStatus = 'pending' | 'unpaid' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface AdminMetric {
  key: string;
  label: string;
  value: number;
  delta?: number;
  deltaLabel?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  format?: 'currency' | 'number' | 'percent';
}

export interface AdminRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminTopProduct {
  productId: string;
  name: string;
  units: number;
  revenue: number;
  stock: number;
  imageUrl?: string;
}

export interface AdminLowStockItem {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  variant?: string;
}

export interface AdminRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  totalAmount: number;
  createdAt: string;
}

export interface AdminDashboardData {
  metrics: AdminMetric[];
  revenue: AdminRevenuePoint[];
  topProducts: AdminTopProduct[];
  lowStock: AdminLowStockItem[];
  recentOrders: AdminRecentOrder[];
  ordersByStatus: Array<{ status: AdminOrderStatus; count: number }>;
}

export interface AdminProductRow {
  id: string;
  name: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stock: number;
  isActive: boolean;
  updatedAt: string;
  brand?: string;
  category?: string;
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  status: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  paymentMethod?: string;
  shippingMethod?: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRow {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role: 'admin' | 'product_manager' | 'warehouse' | 'support' | 'customer';
  createdAt: string;
  lastSignInAt?: string;
}

export interface AuditLogRow {
  id: string;
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ContentBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href?: string;
  placement: 'home_hero' | 'home_strip' | 'products_top' | 'checkout';
  sortOrder: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface ContentBlock {
  id: string;
  key: string;
  title: string;
  body?: string;
  kind: 'announcement' | 'rich_text' | 'feature' | 'faq';
  isActive: boolean;
  updatedAt: string;
}

export interface InventoryRow {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  sku?: string;
  stock: number;
  threshold: number;
  updatedAt: string;
}
