import { setJsonLd } from '@/lib/seo/seo';
import { resolveAppUrl } from '@/lib/ux/paths';

export function setOrganizationSchema(): void {
  setJsonLd('mobilex-schema-organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mobilex',
    url: resolveAppUrl('/'),
  });
}

export function setWebsiteSchema(): void {
  setJsonLd('mobilex-schema-website', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mobilex',
    url: resolveAppUrl('/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${resolveAppUrl('/products')}?query={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });
}

export function setBreadcrumbSchema(items: Array<{ name: string; path: string }>): void {
  setJsonLd('mobilex-schema-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: resolveAppUrl(item.path),
    })),
  });
}
