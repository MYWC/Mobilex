import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { AppRouter } from '@/app/router/AppRouter';
import { AppChrome } from '@/components/layout/AppChrome';
import { useRuntimeStore } from '@/stores/useRuntimeStore';
import { useAppStore } from '@/stores/useAppStore';
import { appEnv } from '@/app/config/env';
import { getMessage } from '@/lib/i18n/i18n';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PlatformLayer } from '@/components/system/PlatformLayer';

function RuntimeBanner(){
  const online=useRuntimeStore(s=>s.online); const locale=useAppStore(s=>s.locale); const t=(k:'offline')=>getMessage(locale,k);
  if(online&&appEnv.isSupabaseConfigured)return null;
  if(appEnv.isProduction && !appEnv.isSupabaseConfigured) return <div className="mx-runtime-stack"><div className="mx-runtime-banner error">Production configuration is incomplete: Supabase must be configured.</div></div>;
  return <div className="mx-runtime-stack">{!online&&<div className="mx-runtime-banner warning">{t('offline')}</div>}{!appEnv.isSupabaseConfigured&&<div className="mx-runtime-banner info">Supabase ENV is not configured — demo storefront mode is active.</div>}</div>
}
export function App(){
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector<HTMLInputElement>('.mx-header-search input')?.focus()}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
  return <BrowserRouter><ErrorBoundary><PlatformLayer/><AppChrome><RuntimeBanner/><AppRouter/></AppChrome></ErrorBoundary></BrowserRouter>
}
