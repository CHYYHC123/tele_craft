import { describe, it, expect } from 'vitest';
import { cn } from '@/utils';

describe('cn', () => {
  it('拼接多个 class', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('过滤掉 falsy 值', () => {
    const active = false;
    expect(cn('base', active && 'active', undefined, null, '')).toBe('base');
  });
});
