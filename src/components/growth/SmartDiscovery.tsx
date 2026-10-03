import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getPersonalizedRecommendations } from '@/features/recommendations/recommendations.service';
import type { CatalogProduct } from '@/types/catalog';
import { useAppStore } from '@/stores/useAppStore';
export function SmartDiscovery() {
  const fa = useAppStore((s) => s.locale === 'fa');
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  useEffect(() => {
    void getPersonalizedRecommendations(8).then(setProducts);
  }, []);
  if (!products.length) return null;
  return (
    <section className="mx-section-inline mx-smart-discovery">
      <div className="mx-shell">
        <div className="mx-discovery-head">
          <SectionHeading
            eyebrow="PERSONALIZED"
            title={fa ? 'پیشنهادهای مخصوص تو' : 'Picked for you'}
            description={
              fa
                ? 'بر اساس رفتار خرید و محصولات مشاهده‌شده.'
                : 'Based on your shopping signals and recent views.'
            }
          />
          <Link className="mx-discovery-link" to="/products">
            <Sparkles size={14} />
            {fa ? 'کشف بیشتر' : 'Discover more'}
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
