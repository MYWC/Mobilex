function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.content = content;
}
function upsertLink(rel: string, href: string) { let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`); if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link)} link.href=href; }
export interface PageSeoOptions { title:string; description:string; path?:string; image?:string; type?:'website'|'product'|'article'; noindex?:boolean; }
export function setPageSeo(title:string,description:string,path?:string){ setSeo({title,description,path}); }
export function setSeo(options:PageSeoOptions){
  document.title=options.title; upsertMeta('description',options.description); upsertMeta('og:title',options.title,'property'); upsertMeta('og:description',options.description,'property'); upsertMeta('og:type',options.type||'website','property'); if(options.image) upsertMeta('og:image',options.image,'property');
  upsertMeta('twitter:card','summary_large_image'); upsertMeta('twitter:title',options.title); upsertMeta('twitter:description',options.description); if(options.image) upsertMeta('twitter:image',options.image);
  upsertMeta('robots', options.noindex ? 'noindex,nofollow' : 'index,follow');
  if(options.path) upsertLink('canonical',new URL(options.path,window.location.origin).href);
}
export function setJsonLd(id:string,data:Record<string,unknown>|Record<string,unknown>[]) { let el=document.getElementById(id) as HTMLScriptElement|null; if(!el){el=document.createElement('script');el.type='application/ld+json';el.id=id;document.head.appendChild(el)} el.textContent=JSON.stringify(data); }
export function removeJsonLd(id:string){document.getElementById(id)?.remove();}
