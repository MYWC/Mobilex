import { describe, expect, it } from 'vitest';
import { useSearchStore } from '@/features/search/search.store';
describe('search store', () => {
  it('deduplicates recent searches', () => {
    useSearchStore.getState().clear();
    useSearchStore.getState().add('iphone');
    useSearchStore.getState().add('iPhone');
    expect(useSearchStore.getState().recent.length).toBe(1);
  });
});
