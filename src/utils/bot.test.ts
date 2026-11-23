import { describe, it, expect } from 'vitest';
import type { Bot } from '@/types/bot';
import { isValidBotToken, resolveCurrentBot } from '@/utils/bot';

const bot = (id: string): Bot => ({
  id,
  telegramBotId: id,
  username: `bot_${id}`,
  displayName: `Bot ${id}`,
});

describe('isValidBotToken', () => {
  it('接受形如 123456789:ABCdef 的 token', () => {
    expect(isValidBotToken('123456789:ABCdef_-123')).toBe(true);
    expect(isValidBotToken('  123456789:ABCdef  ')).toBe(true);
  });

  it('拒绝格式错误的 token', () => {
    expect(isValidBotToken('')).toBe(false);
    expect(isValidBotToken('abc:def')).toBe(false);
    expect(isValidBotToken('123456789')).toBe(false);
    expect(isValidBotToken('123456789:')).toBe(false);
  });
});

describe('resolveCurrentBot', () => {
  it('命中选中 id 时返回该 Bot', () => {
    expect(resolveCurrentBot([bot('1'), bot('2')], '2')?.id).toBe('2');
  });

  it('未选中或不在列表中时取第一个', () => {
    expect(resolveCurrentBot([bot('1'), bot('2')], null)?.id).toBe('1');
    expect(resolveCurrentBot([bot('1'), bot('2')], 'gone')?.id).toBe('1');
  });

  it('列表为空返回 null', () => {
    expect(resolveCurrentBot([], '1')).toBeNull();
  });
});
