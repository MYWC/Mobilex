import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigationEffects, scrollToTop } from '@/lib/ux/navigation';
import { Button } from '@/components/ui/Button';

export function NavigationEffects() {
  useNavigationEffects();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > Math.max(500, window.innerHeight * 0.7));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;
  return (
    <div className="mx-back-to-top-wrap">
      <Button
        aria-label="بازگشت به بالای صفحه"
        title="بازگشت به بالا"
        size="sm"
        variant="glass"
        onClick={() => scrollToTop()}
        icon={<ArrowUp size={15} />}
      >
        بالا
      </Button>
    </div>
  );
}
