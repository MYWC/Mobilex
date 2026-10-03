export function RouteLoading({ label = 'در حال بارگذاری مسیر…' }: { label?: string }) {
  return (
    <main className="route-loading-screen" aria-live="polite" aria-busy="true">
      <div className="route-loading-card glass-panel">
        <div className="spinner" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </main>
  );
}
