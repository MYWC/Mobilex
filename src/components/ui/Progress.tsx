type ProgressProps = { value: number; max?: number; label?: string; showValue?: boolean };
export function Progress({ value, max = 100, label, showValue = true }: ProgressProps) {
  const safe = Math.max(0, Math.min(max, value));
  const pct = max ? Math.round((safe / max) * 100) : 0;
  return (
    <div className="mx-progress-wrap">
      <div className="mx-progress-head">
        {label ? <span>{label}</span> : <span />}
        {showValue && <strong>{pct}%</strong>}
      </div>
      <div
        className="mx-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={safe}
        aria-label={label}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
