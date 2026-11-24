import { describe, it, expect } from 'vitest';
import { formatChange, formatDateTime } from '@/utils/format';

describe('formatChange', () => {
  it('正数带加号，负数保留负号，0 无符号', () => {
    expect(formatChange(20)).toBe('+20%');
    expect(formatChange(-8)).toBe('-8%');
    expect(formatChange(0)).toBe('0%');
  });

  it('null / undefined 展示 --', () => {
    expect(formatChange(null)).toBe('--');
    expect(formatChange(undefined)).toBe('--');
  });
});

describe('formatDateTime', () => {
  it('格式化 ISO 时间', () => {
    expect(formatDateTime('2026-11-15T08:18:20.000Z')).toMatch(/^2026-11-1[5-6] \d{2}:\d{2}$/);
  });

  it('空值或非法值展示 --', () => {
    expect(formatDateTime(null)).toBe('--');
    expect(formatDateTime('not-a-date')).toBe('--');
  });
});
