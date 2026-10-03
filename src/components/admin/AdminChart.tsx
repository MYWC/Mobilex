import { useId } from 'react';
import type { AdminRevenuePoint } from '@/types/admin';
import { formatNumber, formatToman } from '@/lib/format/number';

function points(values: number[], w = 720, h = 250, pad = 18) {
  const max = Math.max(...values, 1),
    min = Math.min(...values, 0);
  return values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / Math.max(max - min, 1)) * (h - pad * 2);
    return [x, y] as const;
  });
}
export function AdminRevenueChart({ data }: { data: AdminRevenuePoint[] }) {
  const id = useId();
  const pts = points(data.map((x) => x.revenue));
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${pts[0][0]},232 ${line} ${pts.at(-1)?.[0] ?? 0},232`;
  return (
    <div className="mx-chart-wrap">
      <svg viewBox="0 0 720 250" role="img" aria-label="نمودار فروش" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".24" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="mx-chart-grid">
          <line x1="18" y1="55" x2="702" y2="55" />
          <line x1="18" y1="115" x2="702" y2="115" />
          <line x1="18" y1="175" x2="702" y2="175" />
          <line x1="18" y1="232" x2="702" y2="232" />
        </g>
        <polygon points={area} fill={`url(#${id})`} className="mx-chart-area" />
        <polyline points={line} fill="none" className="mx-chart-line" />
        {pts
          .filter((_, i) => i === pts.length - 1 || i % 3 === 0)
          .map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.4" className="mx-chart-dot" />
          ))}
      </svg>
      <div className="mx-chart-labels">
        {data
          .filter((_, i) => i % 3 === 0)
          .map((x) => (
            <span key={x.date}>
              {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(x.date))}
            </span>
          ))}
      </div>
    </div>
  );
}
export function AdminBars({ items }: { items: Array<{ label: string; value: number; color?: string }> }) {
  const max = Math.max(...items.map((x) => x.value), 1);
  return (
    <div className="mx-bar-list">
      {items.map((x) => (
        <div className="mx-bar-row" key={x.label}>
          <div className="mx-bar-label">
            <span>{x.label}</span>
            <strong>{formatNumber(x.value, 'fa')}</strong>
          </div>
          <div className="mx-bar-track">
            <i style={{ width: `${(x.value / max) * 100}%`, background: x.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
export function AdminValueList({ items }: { items: Array<{ label: string; value: number }> }) {
  return (
    <div className="mx-value-list">
      {items.map((x) => (
        <div key={x.label}>
          <span>{x.label}</span>
          <strong>{formatToman(x.value, 'fa')}</strong>
        </div>
      ))}
    </div>
  );
}
