import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/format/number';
import { cn } from '@/lib/ui/cn';

type Props={price:number;salePrice?:number;size?:'sm'|'md'|'lg'|'xl';className?:string;showDiscount?:boolean};
export function PriceDisplay({price,salePrice,size='md',className,showDiscount=true}:Props){
  const sale=Number(salePrice||0); const discounted=sale>0&&sale<price; const pct=discounted?Math.round(((price-sale)/price)*100):0; const current=discounted?sale:price;
  return <div className={cn('mx-price-display',`mx-price-${size}`,className)}><div className="mx-price-main"><strong>{formatPrice(current)}</strong>{showDiscount&&discounted&&<Badge tone="danger">{pct}%</Badge>}</div>{discounted&&<div className="mx-price-old">{formatPrice(price)}</div>}</div>;
}
