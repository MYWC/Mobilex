import { useEffect, useState } from 'react';
import { Award, Coins, Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useAppStore } from '@/stores/useAppStore';
import { getLoyaltyAccount, listLoyaltyTransactions } from '@/features/loyalty/loyalty.service';
import type { LoyaltyAccount, LoyaltyTransaction } from '@/features/loyalty/loyalty.types';

export function LoyaltyPage() {
  const fa = useAppStore((s) => s.locale === 'fa');
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [items, setItems] = useState<LoyaltyTransaction[]>([]);
  useEffect(() => {
    void getLoyaltyAccount().then(setAccount);
    void listLoyaltyTransactions().then(setItems);
  }, []);
  if (!account)
    return (
      <div className="mx-page">
        <div className="mx-shell mx-growth-empty">
          <Crown size={42} />
          <h1>{fa ? 'باشگاه مشتریان' : 'Loyalty club'}</h1>
          <p>{fa ? 'برای مشاهده امتیازها وارد حساب شوید.' : 'Login to view your loyalty balance.'}</p>
        </div>
      </div>
    );
  return (
    <div className="mx-page">
      <div className="mx-shell">
        <div className="mx-page-heading-row">
          <div>
            <div className="mx-kicker">MOBILEX REWARDS</div>
            <h1>{fa ? 'باشگاه مشتریان Mobilex' : 'Mobilex Loyalty'}</h1>
            <p>
              {fa
                ? 'با خرید و تعامل بیشتر، امتیاز بگیر و سطح خودت را ارتقا بده.'
                : 'Earn points and unlock higher tiers through purchases and engagement.'}
            </p>
          </div>
        </div>
        <div className="mx-loyalty-hero">
          <Card className="mx-loyalty-main">
            <div className="mx-loyalty-rank">
              <div className="mx-loyalty-icon">
                <Crown size={25} />
              </div>
              <div>
                <span>{fa ? 'سطح فعلی' : 'Current tier'}</span>
                <strong>{account.tier.toUpperCase()}</strong>
              </div>
            </div>
            <div className="mx-loyalty-points">
              <span>{fa ? 'امتیاز قابل استفاده' : 'Available points'}</span>
              <strong>{account.points.toLocaleString()}</strong>
            </div>
            <div className="mx-loyalty-progress">
              <div className="flex justify-between text-xs mb-2">
                <span>{fa ? 'پیشرفت تا سطح بعدی' : 'Progress to next tier'}</span>
                <span>
                  {account.nextTierPoints === Infinity
                    ? fa
                      ? 'بالاترین سطح'
                      : 'Top tier'
                    : `${Math.max(0, account.nextTierPoints - account.lifetimePoints).toLocaleString()} ${fa ? 'امتیاز باقی مانده' : 'points left'}`}
                </span>
              </div>
              <Progress value={account.progress} />
            </div>
          </Card>
          <Card className="mx-loyalty-benefits">
            <div className="mx-kicker">PERKS</div>
            <h2>{fa ? 'مزایای باشگاه' : 'Club benefits'}</h2>
            <div className="mx-benefit-grid">
              <div>
                <Sparkles size={18} />
                <strong>{fa ? 'پیشنهاد شخصی' : 'Personal offers'}</strong>
                <span>
                  {fa ? 'پیشنهادهای ویژه متناسب با خرید شما' : 'Offers tuned to your shopping behavior'}
                </span>
              </div>
              <div>
                <Coins size={18} />
                <strong>{fa ? 'امتیاز خرید' : 'Purchase points'}</strong>
                <span>{fa ? 'با سفارش‌های موفق امتیاز جمع کنید' : 'Earn points from completed orders'}</span>
              </div>
              <div>
                <Award size={18} />
                <strong>{fa ? 'سطح‌بندی' : 'Tier upgrades'}</strong>
                <span>
                  {fa
                    ? 'با افزایش امتیاز سطح شما ارتقا می‌یابد'
                    : 'Reach higher tiers as lifetime points grow'}
                </span>
              </div>
            </div>
          </Card>
        </div>
        <Card className="mx-transactions-card">
          <div className="mx-card-headline">
            <div>
              <div className="mx-kicker">POINT HISTORY</div>
              <h2>{fa ? 'تاریخچه امتیازها' : 'Points history'}</h2>
            </div>
          </div>
          <div className="mx-transaction-list">
            {items.map((i) => (
              <div className="mx-transaction-row" key={i.id}>
                <div className={`mx-transaction-icon ${i.type}`}>
                  <Coins size={15} />
                </div>
                <div>
                  <strong>{i.description}</strong>
                  <time>{new Date(i.createdAt).toLocaleDateString(fa ? 'fa-IR' : 'en-US')}</time>
                </div>
                <b className={i.type === 'redeem' ? 'negative' : 'positive'}>
                  {i.type === 'redeem' ? '−' : '+'}
                  {i.points.toLocaleString()}
                </b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
