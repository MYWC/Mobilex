import { beforeEach, describe, expect, it } from 'vitest';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage/storage';

describe('storage helpers', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips typed JSON values', () => {
    writeStorage('prefs', { dark: true, density: 'compact' });
    expect(readStorage('prefs', null)).toEqual({ dark: true, density: 'compact' });
  });

  it('returns fallback for missing data', () => {
    expect(readStorage('missing', ['fallback'])).toEqual(['fallback']);
  });

  it('removes values cleanly', () => {
    writeStorage('token', 'abc');
    removeStorage('token');
    expect(readStorage('token', null)).toBeNull();
  });
});
