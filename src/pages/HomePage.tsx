import {
  ArrowLeft,
  ArrowUpLeft,
  Flame,
  Headphones,
  ShieldCheck,
  Sparkles,
  Truck,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryRail } from '@/components/catalog/CategoryRail';
import { BrandRail } from '@/components/catalog/BrandRail';
import { Countdown } from '@/components/commerce/Countdown';
import { getCatalogFacets } from '@/services/catalog/catalog.service';
import { getFeaturedProducts, getDemoProducts } from '@/services/catalog/catalog.service';
import { useAppStore } from '@/stores/useAppStore';
import { SmartDiscovery } from '@/components/growth/SmartDiscovery';
import { getMessage } from '@/lib/i18n/i18n';
import type { CatalogProduct, CategorySummary, BrandSummary } from '@/types/catalog';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePageSeo } from '@/hooks/usePageSeo';

export function HomePage() {
  const locale = useAppStore((s) => s.locale);
  const fa = locale === 'fa';
  const t = (key: any) => getMessage(locale, key);

  const [featured, setFeatured] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void Promise.all([getFeaturedProducts(), getCatalogFacets()])
      .then(([x, facets]) => {
        if (active) {
          setFeatured(x);
          setCategories(facets.categories);
          setBrands(facets.brands);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  usePageSeo({
    title: fa ? 'Mobilex — فروشگاه نسل جدید موبایل' : 'Mobilex — Next-generation mobile store',
    description: fa
      ? 'کشف، مقایسه و خرید موبایل با تجربه‌ای سریع و مدرن.'
      : 'Discover, compare and buy mobile products through a fast, modern storefront.',
    path: '/',
  });

  const demo = getDemoProducts();

  const sale = useMemo(
    () => demo.filter((p) => p.salePrice && p.salePrice < p.price).slice(0, 4),
    [demo],
  );

  const newItems = useMemo(() => demo.filter((p) => p.isNew).slice(0, 4), [demo]);

  return (
    <div className="mx-storefront">
      <section className="mx-home-hero">
        <div className="mx-hero-orb orb-a" />
        <div className="mx-hero-orb orb-b" />

        <div className="mx-shell mx-hero-grid">
          <div className="mx-hero-copy">
            <Badge tone="primary" dot pulse>
              {fa ? 'فروشگاه نسل جدید موبایل' : 'Next-generation mobile store'}
            </Badge>

            <h1>
              {fa ? (
                <>
                  تجربه‌ی خرید موبایل،
                  <br />
                  بدون مرز.
                </>
              ) : (
                <>
                  Mobile shopping,
                  <br />
                  without limits.
                </>
              )}
            </h1>

            <p>
              {fa
                ? 'Mobilex برای جست‌وجو، مقایسه و خرید هوشمندانه ساخته شده؛ سریع، شفاف و دقیق.'
                : 'A storefront engineered for discovery, comparison, and confident buying — fast, clear, and refined.'}
            </p>

            <div className="mx-hero-actions">
              <Link to="/products">
                <Button
                  size="lg"
                  icon={<Sparkles size={17} />}
                  iconAfter={fa ? <ArrowLeft size={16} /> : <ArrowUpLeft size={16} />}
                >
                  {fa ? 'اکتشاف محصولات' : 'Explore products'}
                </Button>
              </Link>

              <Link to="/products?sort=newest">
                <Button size="lg" variant="glass">
                  {fa ? 'جدیدترین‌ها' : 'New arrivals'}
                </Button>
              </Link>
            </div>

            <div className="mx-hero-proof">
              <span>
                <ShieldCheck size={15} /> {fa ? 'خرید امن' : 'Secure purchase'}
              </span>
              <span>
                <Truck size={15} /> {fa ? 'ارسال سریع' : 'Fast shipping'}
              </span>
              <span>
                <Headphones size={15} /> {fa ? 'پشتیبانی' : 'Support'}
              </span>
            </div>
          </div>

          <div className="mx-hero-showcase">
            <div className="mx-device-shadow" />

            <div className="mx-device">
              <div className="mx-device-camera">
                <i />
                <i />
                <i />
              </div>

              <div className="mx-device-screen">
                <span>MX</span>
                <small>2.0</small>
              </div>
            </div>

            <div className="mx-floating-card floating-price">
              <span>FLASH</span>
              <strong>تا ۲۰٪</strong>
              <small>{fa ? 'تخفیف امروز' : 'today only'}</small>
            </div>

            <div className="mx-floating-card floating-rating">
              <strong>4.9</strong>
              <span>★★★★★</span>
              <small>12k+ {fa ? 'رضایت' : 'happy buyers'}</small>
            </div>
          </div>
        </div>

        <div className="mx-hero-scroll">
          <span>{fa ? 'برای کشف بیشتر اسکرول کنید' : 'Scroll to explore'}</span>
          <ChevronDown size={16} />
        </div>
      </section>

      <SmartDiscovery />

      <section className="mx-section mx-section-compact">
        <div className="mx-shell">
          <SectionHeading
            eyebrow="DISCOVER"
            title={fa ? 'دسته‌بندی‌ها' : 'Browse categories'}
            description={
              fa ? 'سریع‌تر به چیزی که دنبالش هستی برس.' : 'Jump straight to what you want.'
            }
          />

          <CategoryRail categories={categories} />
        </div>
      </section>

      <section className="mx-section mx-section-compact">
        <div className="mx-shell">
          <SectionHeading
            eyebrow="BRANDS"
            title={fa ? 'انتخاب بر اساس برند' : 'Shop by brand'}
            description={
              fa
                ? 'برند مورد علاقه‌ات را انتخاب کن و مستقیم وارد محصولاتش شو.'
                : 'Choose a brand and jump directly to its products.'
            }
          />

          <BrandRail brands={brands} limit={24} />
        </div>
      </section>

      <section className="mx-section">
        <div className="mx-shell">
          <SectionHeading
            eyebrow="TRENDING NOW"
            title={fa ? 'محصولات داغ این هفته' : 'Trending this week'}
            description={
              fa
                ? 'محصولاتی که بیشترین توجه را گرفته‌اند.'
                : 'The products getting the most attention right now.'
            }
            actions={
              <Link to="/products">
                <Button variant="outline" size="sm" iconAfter={<ArrowUpLeft size={16} />}>
                  {fa ? 'مشاهده همه' : 'View all'}
                </Button>
              </Link>
            }
          />

          {loading ? (
            <div className="mx-product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <div className="mx-skeleton-product">
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <ProductGrid products={featured.slice(0, 4)} />
          )}
        </div>
      </section>

      <section className="mx-section mx-section-soft">
        <div className="mx-shell">
          <div className="mx-promo-strip">
            <div>
              <Badge tone="danger">
                <Flame size={13} /> FLASH DEAL
              </Badge>

              <h2>
                {fa
                  ? 'برای علاقه‌مندی‌هایت، وقت تخفیف است.'
                  : 'Your wishlist just got more exciting.'}
              </h2>

              <p>
                {fa
                  ? 'تخفیف‌های محدود را قبل از تمام شدن ببین.'
                  : 'Limited-time prices before the timer runs out.'}
              </p>

              <Countdown hours={11} />
            </div>

            <Link to="/products?sale=1">
              <Button variant="danger" icon={<Flame size={16} />}>
                {fa ? 'مشاهده تخفیف‌ها' : 'Shop sale'}
              </Button>
            </Link>
          </div>

          <div className="mx-sale-grid">
            <ProductGrid products={sale} />
          </div>
        </div>
      </section>

      <section className="mx-section">
        <div className="mx-shell">
          <SectionHeading
            eyebrow="NEW ARRIVALS"
            title={fa ? 'تازه‌واردها را زودتر ببین' : 'See what just landed'}
            description={
              fa
                ? 'محصولات جدید، قبل از اینکه تبدیل به ترند شوند.'
                : 'Fresh products before they become tomorrow’s trend.'
            }
            actions={
              <Link to="/products?new=1">
                <Button variant="outline" size="sm">
                  {fa ? 'جدیدترین محصولات' : 'Latest products'}
                </Button>
              </Link>
            }
          />

          <ProductGrid products={newItems} />
        </div>
      </section>

      <section className="mx-section mx-section-soft">
        <div className="mx-shell">
          <SectionHeading
            eyebrow="WHY MOBILEX"
            title={fa ? 'یک فروشگاه، چند لایه اعتماد' : 'One store. Multiple layers of trust'}
            description={
              fa
                ? 'همه‌چیز از کشف محصول تا تصمیم نهایی با یک زبان بصری و تجربه واحد ساخته شده است.'
                : 'Discovery, comparison, and decision-making — all under one consistent experience.'
            }
          />

          <div className="mx-benefit-grid">
            {[
              [ShieldCheck, 'خرید مطمئن', 'لایه‌های امنیتی و اعتبارسنجی برای عملیات حساس.'],
              [Truck, 'ارسال سریع', 'تجربه‌ی شفاف ارسال، رهگیری و وضعیت سفارش.'],
              [Headphones, 'پشتیبانی واقعی', 'مسیر روشن برای سؤال، پیگیری و حل مسئله.'],
              [Sparkles, 'تجربه هوشمند', 'جستجو، پیشنهاد و مقایسه با کمترین اصطکاک.'],
            ].map(([Icon, title, text], i) => {
              const C = Icon as any;

              return (
                <Card key={i} className="mx-benefit-card">
                  <div className="mx-benefit-icon">
                    <C size={19} />
                  </div>

                  <h3>
                    {fa
                      ? String(title)
                      : i === 0
                        ? 'Trusted shopping'
                        : i === 1
                          ? 'Fast delivery'
                          : i === 2
                            ? 'Human support'
                            : 'Smart discovery'}
                  </h3>

                  <p>
                    {fa
                      ? String(text)
                      : [
                          'Validation-first security layers for sensitive actions.',
                          'Transparent delivery and tracking experience.',
                          'A clear path to questions and issue resolution.',
                          'Search, discovery and comparison with less friction.',
                        ][i]}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
