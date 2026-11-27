import type { ChatMessage, ChatMessagePage } from '@/types/chat';

/**
 * 把新消息并入已缓存的消息页。
 * 缓存里 items 新的在前；fresh 是旧的在前（afterId 轮询或刚发送成功的消息）。
 * 按 id 去重：轮询和发送成功的回写可能同时带来同一条消息。
 */
export const mergeNewerMessages = (
  page: ChatMessagePage,
  fresh: ChatMessage[],
): ChatMessagePage => {
  const known = new Set(page.items.map((item) => item.id));
  const added = fresh.filter((item) => !known.has(item.id)).reverse();
  if (added.length === 0) return page;
  return { ...page, items: [...added, ...page.items] };
};

/**
 * 把更早的历史并到缓存末尾；older 是新的在前（before 翻页），hasMore 取这一页的值。
 */
export const appendOlderMessages = (
  page: ChatMessagePage,
  older: ChatMessagePage,
): ChatMessagePage => {
  const known = new Set(page.items.map((item) => item.id));
  return {
    items: [...page.items, ...older.items.filter((item) => !known.has(item.id))],
    hasMore: older.hasMore,
  };
};
