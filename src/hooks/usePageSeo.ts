import { useEffect } from 'react';
import { setSeo, setJsonLd, removeJsonLd, type PageSeoOptions } from '@/lib/seo/seo';
export function usePageSeo(options: PageSeoOptions, jsonLd?: Record<string, unknown>): void {
  useEffect(() => {
    setSeo(options);
    if (jsonLd) setJsonLd('mx-page-jsonld', jsonLd);
    return () => {
      removeJsonLd('mx-page-jsonld');
    };
  }, [
    options.title,
    options.description,
    options.path,
    options.image,
    options.type,
    options.noindex,
    jsonLd,
  ]);
}
