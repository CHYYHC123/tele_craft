import type { ChatMessage, ChatMessagePage } from '@/types/chat';
import { appendOlderMessages, mergeNewerMessages } from '@/utils/chat';

const msg = (id: string): ChatMessage => ({
  id,
  direction: 'in',
  source: 'user',
  messageType: 'text',
  text: id,
  imageUrl: null,
  telegramMessageId: 1,
  clientMessageId: null,
  createdAt: '2026-11-27T07:00:00.000Z',
});

const ids = (page: ChatMessagePage) => page.items.map((item) => item.id);

describe('mergeNewerMessages', () => {
  const page: ChatMessagePage = { items: [msg('c'), msg('b')], hasMore: true };

  it('新消息（旧的在前）放到最前面，保持新的在前', () => {
    expect(ids(mergeNewerMessages(page, [msg('d'), msg('e')]))).toEqual(['e', 'd', 'c', 'b']);
  });

  it('按 id 去重，没有新增时返回原对象', () => {
    expect(mergeNewerMessages(page, [msg('c')])).toBe(page);
    expect(ids(mergeNewerMessages(page, [msg('c'), msg('d')]))).toEqual(['d', 'c', 'b']);
  });

  it('保留 hasMore', () => {
    expect(mergeNewerMessages(page, [msg('d')]).hasMore).toBe(true);
  });
});

describe('appendOlderMessages', () => {
  it('更早的历史接到末尾，hasMore 取这一页的值', () => {
    const page: ChatMessagePage = { items: [msg('c'), msg('b')], hasMore: true };
    const older: ChatMessagePage = { items: [msg('a'), msg('z')], hasMore: false };
    const merged = appendOlderMessages(page, older);

    expect(ids(merged)).toEqual(['c', 'b', 'a', 'z']);
    expect(merged.hasMore).toBe(false);
  });

  it('按 id 去重', () => {
    const page: ChatMessagePage = { items: [msg('c'), msg('b')], hasMore: true };
    const older: ChatMessagePage = { items: [msg('b'), msg('a')], hasMore: true };

    expect(ids(appendOlderMessages(page, older))).toEqual(['c', 'b', 'a']);
  });
});
