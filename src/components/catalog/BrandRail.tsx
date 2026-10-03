import { ArrowUpLeft, Smartphone, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { BrandSummary } from '@/types/catalog';
import { useAppStore } from '@/stores/useAppStore';

function getInitials(brand: BrandSummary) {
  const value = (brand.nameEn || brand.nameFa || '').trim();

  if (!value) return 'M';

  const words = value.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

export function BrandRail({
  brands,
  limit = 24,
}: {
  brands: BrandSummary[];
  limit?: number;
}) {
  const locale = useAppStore((s) => s.locale);
  const fa = locale === 'fa';
  const [query, setQuery] = useState('');

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();

    const source = brands
      .filter((brand) => brand.nameFa || brand.nameEn)
      .filter((brand) => {
        if (!q) return true;

        return [brand.nameFa, brand.nameEn, brand.slug]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()
          .includes(q);
      });

    return source.slice(0, limit);
  }, [brands, limit, query]);

  if (!brands.length) return null;

  return (
    <div className="mx-brand-section">
      <div className="mx-brand-search">
        <Search size={15} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={fa ? 'جستجوی برند...' : 'Search brands...'}
          aria-label={fa ? 'جستجوی برند' : 'Search brands'}
        />
      </div>

      <div className="mx-brand-rail">
        {filteredBrands.map((brand) => {
          const name = fa
            ? brand.nameFa || brand.nameEn || ''
            : brand.nameEn || brand.nameFa || '';

          const initials = getInitials(brand);

          return (
            <Link
              key={brand.id}
              to={`/products?brand=${encodeURIComponent(brand.id)}`}
              className="mx-brand-card"
              aria-label={`${fa ? 'مشاهده محصولات' : 'View products'} ${name}`}
            >
              <span className="mx-brand-logo">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt="" loading="lazy" />
                ) : (
                  <>
                    <Smartphone size={13} />
                    <strong>{initials}</strong>
                  </>
                )}
              </span>

              <span className="mx-brand-copy">
                <strong>{name}</strong>
                <small>{brand.slug || ''}</small>
              </span>

              <ArrowUpLeft size={14} className="mx-brand-arrow" />
            </Link>
          );
        })}
      </div>

      {!filteredBrands.length && (
        <div className="mx-brand-empty">
          {fa ? 'برندی پیدا نشد.' : 'No brands found.'}
        </div>
      )}
    </div>
  );
}
