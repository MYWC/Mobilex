import { appEnv } from '@/app/config/env';
import { useRuntimeStore } from '@/stores/useRuntimeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/features/cart/cart.store';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';

export interface HealthSnapshot {
  online:boolean;
  supabaseConfigured:boolean;
  authInitialized:boolean;
  authStatus:string;
  cartItems:number;
  cartCount:number;
  wishlistCount:number;
  timestamp:string;
}

export function getClientHealthSnapshot(): HealthSnapshot {
  const runtime = useRuntimeStore.getState();
  const auth = useAuthStore.getState();
  const cart = useCartStore.getState();
  const wishlist = useWishlistStore.getState();
  return {
    online: runtime.online,
    supabaseConfigured: appEnv.isSupabaseConfigured,
    authInitialized: auth.initialized,
    authStatus: auth.status,
    cartItems: cart.items.length,
    cartCount: cart.count(),
    wishlistCount: wishlist.ids.length,
    timestamp: new Date().toISOString(),
  };
}
