import { Heart, Home, ShoppingCart, UserRound, PackageSearch } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/features/cart/cart.store';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { getMessage } from '@/lib/i18n/i18n';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/ui/cn';

export function MobileBottomNav() {
  const locale=useAppStore(s=>s.locale); const user=useAuthStore(s=>s.appUser);
  const cart=useCartStore(s=>s.count()); const wish=useWishlistStore(s=>s.ids.length);
  const t=(k:'home'|'wishlist'|'cart'|'orders'|'account')=>getMessage(locale,k);
  const items=[
    {to:'/',label:t('home'),icon:Home},
    {to:'/wishlist',label:t('wishlist'),icon:Heart,count:wish},
    {to:'/cart',label:t('cart'),icon:ShoppingCart,count:cart},
    ...(user?[{to:'/orders',label:t('orders'),icon:PackageSearch}]:[]),
    {to:user?'/account':'/login',label:user?t('account'):(locale==='fa'?'ورود':'Login'),icon:UserRound},
  ];
  return <nav className="mx-bottom-nav" aria-label="Mobile navigation">{items.map(({to,label,icon:Icon,count})=><NavLink key={to} to={to} className={({isActive})=>cn('mx-bottom-link',isActive&&'is-active')}><span className="mx-bottom-icon"><Icon size={18}/>{count? <span>{count>99?'99+':count}</span>:null}</span><small>{label}</small></NavLink>)}</nav>;
}
