import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent, formatToman } from '@/lib/format/number';

describe('formatting', () => {
  it('formats Persian numbers', () => {
    expect(formatNumber(1234567, 'fa')).toContain('۱');
    expect(formatToman(1234, 'fa')).toContain('تومان');
  });

  it('formats percentage values', () => {
    expect(formatPercent(0.42, 'en')).toContain('%');
  });
});
