import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

export function SiteFooter() {
  return <footer className="mx-footer">
    <div className="mx-footer-glow" aria-hidden="true" />
    <div className="mx-shell">
      <div className="mx-footer-grid">
        <div className="mx-footer-brand">
          <Link to="/" className="mx-brand"><span className="mx-brand-mark"><span>M</span></span><span className="mx-brand-copy"><strong>Mobilex <em>2.0</em></strong><small>mobile commerce platform</small></span></Link>
          <p>فروشگاه دیجیتال نسل جدید با تمرکز روی تجربه کاربری سریع، طراحی دقیق و معماری قابل توسعه.</p>
        </div>
        <div><h3>فروشگاه</h3><Link to="/products">محصولات</Link><Link to="/wishlist">علاقه‌مندی‌ها</Link><Link to="/cart">سبد خرید</Link></div>
        <div><h3>حساب</h3><Link to="/account">حساب کاربری</Link><Link to="/orders">سفارش‌ها</Link><Link to="/login">ورود</Link></div>
        <div><h3>Mobilex 2.0</h3><div className="mx-footer-feature"><Zap size={15}/> سریع و سبک</div><div className="mx-footer-feature"><ShieldCheck size={15}/> امن و کنترل‌شده</div><div className="mx-footer-feature"><Sparkles size={15}/> طراحی نسل جدید</div></div>
      </div>
      <div className="mx-footer-bottom"><span>© 2026 Mobilex. All rights reserved.</span><span>Built for scale · Phase 2 Design System</span></div>
    </div>
  </footer>;
}
