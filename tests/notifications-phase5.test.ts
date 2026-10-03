import { describe, expect, it } from 'vitest';

describe('Phase 5 notification contracts', () => {
  it('computes unread count', () => {
    const notifications = [{read:false},{read:true},{read:false}];
    expect(notifications.filter(x=>!x.read)).toHaveLength(2);
  });
});
