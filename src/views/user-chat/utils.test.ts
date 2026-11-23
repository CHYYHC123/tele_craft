import type { Chat } from '@/views/user-chat/types';
import {
  filterChats,
  formatDateLabel,
  formatMessageTime,
  getLastMessagePreview,
} from '@/views/user-chat/utils';

const makeChat = (name: string, sender: 'user' | 'bot', text: string): Chat => ({
  id: 1,
  name,
  tone: 'blue',
  lastTime: '11:00 AM',
  folder: 'open',
  mutedFor: null,
  messages: [{ id: 1, sender, text, time: '11:00', dateLabel: 'August 15, 2024' }],
});

describe('getLastMessagePreview', () => {
  it('客服自己发的消息加 You: 前缀', () => {
    expect(getLastMessagePreview(makeChat('Ahmet', 'bot', 'Hi'))).toBe('You: Hi');
  });

  it('用户消息原样返回', () => {
    expect(getLastMessagePreview(makeChat('Ahmet', 'user', 'Hello'))).toBe('Hello');
  });
});

describe('filterChats', () => {
  const chats = [makeChat('Ahmet', 'user', 'Hello'), makeChat('xiao', 'user', 'refund please')];

  it('空搜索返回全部', () => {
    expect(filterChats(chats, ' ')).toEqual(chats);
  });

  it('按用户名或消息内容匹配，忽略大小写', () => {
    expect(filterChats(chats, 'AHM')).toEqual([chats[0]]);
    expect(filterChats(chats, 'Refund')).toEqual([chats[1]]);
  });
});

describe('时间格式化', () => {
  it('气泡时间为 24 小时制，零点不出现 24', () => {
    expect(formatMessageTime(new Date(2024, 7, 15, 0, 5))).toBe('00:05');
    expect(formatMessageTime(new Date(2024, 7, 15, 11, 43))).toBe('11:43');
  });

  it('日期分隔文案', () => {
    expect(formatDateLabel(new Date(2024, 7, 15))).toBe('August 15, 2024');
  });
});
