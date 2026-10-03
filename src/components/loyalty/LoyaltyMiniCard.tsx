import { Link } from 'react-router-dom';
import { Award, ChevronLeft, Coins } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/stores/useAppStore';
import { getLoyaltyAccount } from '@/features/loyalty/loyalty.service';
import { useEffect, useState } from 'react';
export function LoyaltyMiniCard() {
  const fa = useAppStore((s) => s.locale === 'fa');
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState('starter');
  useEffect(() => {
    void getLoyaltyAccount().then((a) => {
      if (a) {
        setPoints(a.points);
        setTier(a.tier);
      }
    });
  }, []);
  return (
    <Card className="mx-loyalty-mini">
      <div className="mx-loyalty-mini-icon">
        <Award size={18} />
      </div>
      <div>
        <span>{fa ? 'باشگاه مشتریان' : 'Rewards club'}</span>
        <strong>
          {points.toLocaleString()} <small>{fa ? 'امتیاز' : 'points'}</small>
        </strong>
        <em>{tier.toUpperCase()}</em>
      </div>
      <Link to="/account/loyalty" aria-label="loyalty">
        <ChevronLeft size={16} />
      </Link>
      <Coins className="mx-loyalty-mini-bg" size={55} />
    </Card>
  );
}
