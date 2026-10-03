import { WifiOff, RefreshCcw } from 'lucide-react';
import { useRuntimeStore } from '@/stores/useRuntimeStore';
import { Button } from '@/components/ui/Button';

export function OfflineBanner() {
  const online = useRuntimeStore(s => s.online);
  if (online) return null;
  return <div className="mx-offline-banner" role="status"><WifiOff size={15}/><span>اتصال اینترنت قطع است؛ برخی اطلاعات ممکن است از حافظه محلی نمایش داده شوند.</span><Button size="sm" variant="glass" icon={<RefreshCcw size={13}/>} onClick={() => window.location.reload()}>تلاش مجدد</Button></div>;
}
