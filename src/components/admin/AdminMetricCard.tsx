import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { AdminMetric } from '@/types/admin';
import { formatNumber, formatToman } from '@/lib/format/number';

export function AdminMetricCard({metric}:{metric:AdminMetric}){
  const value=metric.format==='currency'?formatToman(metric.value,'fa'):metric.format==='percent'?`${metric.value}%`:formatNumber(metric.value,'fa');
  const Icon=metric.delta==null?Minus:metric.delta>=0?ArrowUpRight:ArrowDownRight;
  return <article className={`mx-admin-metric tone-${metric.tone||'primary'}`}><div className="mx-admin-metric-top"><span>{metric.label}</span><div className="mx-admin-metric-icon">{metric.tone==='success'?'↗':metric.tone==='danger'?'!':metric.tone==='warning'?'◔':'✦'}</div></div><strong>{value}</strong>{metric.delta!=null&&<div className={`mx-admin-delta ${metric.delta>=0?'is-up':'is-down'}`}><Icon size={13}/>{Math.abs(metric.delta)}% <span>نسبت به دوره قبل</span></div>}</article>;
}
