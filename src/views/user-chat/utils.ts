import type { Chat } from '@/views/user-chat/types';

/** 列表时间：11:55 AM */
export const formatListTime = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/** 气泡时间：11:43（24 小时制） */
export const formatMessageTime = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** 日期分隔：August 15, 2024 */
export const formatDateLabel = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** 列表第二行预览：客服自己发的加 "You: " 前缀 */
export const getLastMessagePreview = (chat: Chat): string => {
  const last = chat.messages.at(-1);
  if (!last) return '';
  return last.sender === 'bot' ? `You: ${last.text}` : last.text;
};

/** 按用户名或最后一条消息模糊过滤（忽略大小写与首尾空格） */
export const filterChats = (chats: Chat[], search: string): Chat[] => {
  const query = search.trim().toLowerCase();
  if (!query) return chats;
  return chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(query) ||
      getLastMessagePreview(chat).toLowerCase().includes(query),
  );
};
