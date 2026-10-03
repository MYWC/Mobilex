export interface AccountStats {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  wishlistCount: number;
  unreadNotifications: number;
  lifetimeSpend: number;
}

export interface UserProfileSnapshot {
  id: string;
  email?: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface AccountPreferences {
  marketingEmail: boolean;
  orderEmail: boolean;
  pushNotifications: boolean;
  priceDropAlerts: boolean;
  restockAlerts: boolean;
}
