import { useEffect, useMemo, useState } from 'react';
function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}
export function Countdown({ hours = 11 }: { hours?: number }) {
  const end = useMemo(() => Date.now() + hours * 3600 * 1000, []);
  const [left, setLeft] = useState(end - Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setLeft(end - Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [end]);
  const p = parts(left);
  return (
    <div className="mx-countdown" aria-label="Flash sale countdown">
      {[
        ['d', 'روز'],
        ['h', 'ساعت'],
        ['m', 'دقیقه'],
        ['s', 'ثانیه'],
      ].map(([k, l], i) => (
        <div key={k}>
          <strong>{String(p[k as keyof typeof p]).padStart(2, '0')}</strong>
          <span>{l}</span>
          {i < 3 && <em>:</em>}
        </div>
      ))}
    </div>
  );
}
