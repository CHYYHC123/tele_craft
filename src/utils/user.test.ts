import { describe, it, expect } from 'vitest';
import { getUserDisplayName } from '@/utils/user';

describe('getUserDisplayName', () => {
  it('优先使用姓名', () => {
    expect(getUserDisplayName({ firstName: 'Ada', lastName: 'Lovelace', username: 'ada' })).toBe(
      'Ada Lovelace',
    );
  });

  it('没有姓名时回退到 username', () => {
    expect(getUserDisplayName({ firstName: '', lastName: '', username: 'ada' })).toBe('ada');
  });

  it('没有用户时返回空字符串', () => {
    expect(getUserDisplayName(null)).toBe('');
  });
});
