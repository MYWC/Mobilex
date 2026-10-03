import { ArrowRight, Home, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="error-screen">
      <section className="error-card glass-panel">
        <div className="error-icon"><SearchX size={30} /></div>
        <span className="eyebrow">404 / MOBILEX</span>
        <h1>این صفحه پیدا نشد</h1>
        <p>آدرس واردشده در Router فعلی Mobilex 2.0 تعریف نشده است.</p>
        <Link className="button button-primary" to="/">
          <Home size={17} />
          بازگشت به خانه
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
