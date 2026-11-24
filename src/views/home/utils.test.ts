import { describe, it, expect } from 'vitest';
import { buildStatItems, getSubscriberName } from '@/views/home/utils';

describe('buildStatItems', () => {
  it('没有数据时 value 为空', () => {
    expect(buildStatItems(undefined).every((item) => item.value === undefined)).toBe(true);
  });

  it('映射数字与对比，activeToday 没有对比', () => {
    const items = buildStatItems({
      followersAll: 2420,
      followersAllChange: 20,
      addedToday: 125,
      addedTodayChange: null,
      activeToday: 316,
      unsubscribedToday: 12,
      unsubscribedTodayChange: -8,
    });
    const byKey = Object.fromEntries(items.map((item) => [item.key, item]));
    expect(byKey.followers).toMatchObject({ value: '2,420', change: 20 });
    expect(byKey.added).toMatchObject({ value: '125', change: null });
    expect(byKey.active.value).toBe('316');
    expect(byKey.active.change).toBeUndefined();
    expect(byKey.unsubscribed).toMatchObject({ value: '12', change: -8 });
  });
});

describe('getSubscriberName', () => {
  it('拼接姓名并过滤空值', () => {
    const base = {
      telegramUserId: '1',
      username: null,
      phone: null,
      firstSeenAt: '',
      lastActiveAt: '',
    };
    expect(getSubscriberName({ ...base, firstName: 'Olivia', lastName: 'Rhye' })).toBe(
      'Olivia Rhye',
    );
    expect(getSubscriberName({ ...base, firstName: 'Olivia', lastName: null })).toBe('Olivia');
  });
});
