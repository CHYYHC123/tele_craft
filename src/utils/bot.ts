import type { Bot } from '@/types/bot';

const BOT_TOKEN_PATTERN = /^\d+:[A-Za-z0-9_-]+$/;

/** Bot API token 格式校验：形如 123456789:ABCdef... */
export const isValidBotToken = (token: string): boolean => BOT_TOKEN_PATTERN.test(token.trim());

/** 当前选中的 Bot：selectedBotId 命中列表则用它，否则取第一个，列表为空返回 null */
export const resolveCurrentBot = (bots: Bot[], selectedBotId: string | null): Bot | null =>
  bots.find((bot) => bot.id === selectedBotId) ?? bots[0] ?? null;
