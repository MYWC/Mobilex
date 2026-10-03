import { describe, expect, it } from 'vitest';
import { getMessage } from '@/lib/i18n/i18n';

describe('i18n core', () => {
  it('returns localized messages', () => {
    expect(getMessage('fa', 'appName')).toBe('Mobilex');
    expect(getMessage('en', 'heroEyebrow')).toContain('mobile');
  });
});
