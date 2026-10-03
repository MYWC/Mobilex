import { useEffect, useRef, type PropsWithChildren } from 'react';
import { useRuntimeStore } from '@/stores/useRuntimeStore';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/features/cart/cart.store';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { useNotificationStore } from '@/features/notifications/notification.store';
import { useRecentStore } from '@/features/catalog/recent.store';
import { useCompareStore } from '@/features/compare/compare.store';
import { useSearchStore } from '@/features/search/search.store';
import { logger } from '@/lib/logger/logger';
import { migrateLegacyStorage } from '@/lib/storage/migrations';
import { useCommerceStore } from '@/features/commerce/commerce.store';
import { track } from '@/lib/observability/telemetry';

export function AppProviders({ children }: PropsWithChildren) {
  const hydrate = useAppStore(s=>s.hydrate);
  const initNetwork = useRuntimeStore(s=>s.initNetworkListener);
  const initializeAuth = useAuthStore(s=>s.initialize);
  const userId = useAuthStore(s=>s.appUser?.id ?? null);
  const hydrateCart=useCartStore(s=>s.hydrate), hydrateWishlist=useWishlistStore(s=>s.hydrate), hydrateNotifications=useNotificationStore(s=>s.hydrate);
  const hydrateRecent=useRecentStore(s=>s.hydrate), hydrateSearch=useSearchStore(s=>s.hydrate), hydrateCommerce=useCommerceStore(s=>s.hydrate), hydrateCompare=useCompareStore(s=>s.hydrate);
  const syncWishlist=useWishlistStore(s=>s.syncWithCloud); const syncNotifications=useNotificationStore(s=>s.syncRemote); const startRealtime=useNotificationStore(s=>s.startRealtime);
  const cleanupRef=useRef<null|(()=>void)>(null);
  const notificationCleanupRef=useRef<null|(()=>void)>(null);
  useEffect(()=>{
    migrateLegacyStorage(); hydrate(); hydrateCart(); hydrateWishlist(); hydrateNotifications(); hydrateRecent(); hydrateSearch(); hydrateCommerce(); hydrateCompare();
    const offNetwork=initNetwork(); let active=true;
    void initializeAuth().then(cleanup=>{if(active)cleanupRef.current=cleanup;else cleanup()}).catch(e=>logger.error('Auth initialization failed',e));
    const onStorage=(e:StorageEvent)=>{if(!e.key)return;if(['mobilex.cart','mobilex.wishlist','mobilex.notifications','mobilex.locale','mobilex.theme','mobilex.recent-searches','mobilex.recently-viewed','mobile-shop-cart','mobile-shop-wishlist','mobilex.compare'].includes(e.key)){hydrateCart();hydrateWishlist();hydrateNotifications();hydrateRecent();hydrateSearch();hydrateCommerce();hydrateCompare()}};
    window.addEventListener('storage',onStorage);
    return()=>{active=false;offNetwork();window.removeEventListener('storage',onStorage);cleanupRef.current?.();cleanupRef.current=null;notificationCleanupRef.current?.();notificationCleanupRef.current=null};
  },[hydrate,initNetwork,initializeAuth,hydrateCart,hydrateWishlist,hydrateNotifications,hydrateRecent,hydrateSearch,hydrateCommerce,hydrateCompare]);
  useEffect(()=>{
    const onPerformance = (event: Event) => {
      const metric = (event as CustomEvent).detail;
      if (metric && typeof metric.name === 'string') track({ type: 'metric', name: metric.name, payload: { value: metric.value, rating: metric.rating } });
    };
    window.addEventListener('mobilex:performance', onPerformance);
    return () => window.removeEventListener('mobilex:performance', onPerformance);
  },[]);
  useEffect(()=>{
    notificationCleanupRef.current?.(); notificationCleanupRef.current=null;
    if(!userId)return;
    void syncWishlist().catch(e=>logger.warn('Wishlist cloud sync failed',e)); void syncNotifications().catch(e=>logger.warn('Notification sync failed',e));
    let active=true; void startRealtime().then(cleanup=>{if(active){notificationCleanupRef.current=cleanup}else cleanup()}).catch(e=>logger.warn('Notification realtime failed',e));
    return()=>{active=false;notificationCleanupRef.current?.();notificationCleanupRef.current=null};
  },[userId,syncWishlist,syncNotifications,startRealtime]);
  return <>{children}</>;
}
