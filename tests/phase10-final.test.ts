import { describe, expect, it } from 'vitest';
import { getReleaseSnapshot } from '@/lib/release/release';

describe('Phase 10 final release', () => {
  it('exposes a final release snapshot', () => {
    const snapshot = getReleaseSnapshot();
    expect(snapshot.version).toBe('2.0.0');
    expect(snapshot.checks.length).toBeGreaterThanOrEqual(5);
    expect(snapshot.checks.some((c) => c.id === 'payment-boundary')).toBe(true);
  });

  it('never treats production without Supabase as a ready client environment', () => {
    const snapshot = getReleaseSnapshot();
    if (snapshot.environment === 'production') {
      const supabase = snapshot.checks.find((c) => c.id === 'supabase');
      expect(supabase?.ok).toBe(true);
    }
  });
});
