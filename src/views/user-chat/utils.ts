import type { ChatSession } from '@/types/chat';
import type { AvatarTone } from '@/views/user-chat/types';

type DateInput = Date | string;

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value));

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const DAY_MS = 24 * 60 * 60 * 1000;

/** 列表右上角时间：当天 11:55 AM，一周内 Thu，更早 08/13/2024 */
export const formatListTime = (value: DateInput, now: Date = new Date()): string => {
  const date = toDate(value);
  if (isSameDay(date, now)) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (now.getTime() - date.getTime() < 6 * DAY_MS) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

/** 气泡时间：11:43（24 小时制） */
export const formatMessageTime = (value: DateInput): string =>
  toDate(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

/** 日期分隔：August 15, 2024 */
export const formatDateLabel = (value: DateInput): string =>
  toDate(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** 资料面板里的完整时间：Aug 15, 2024, 11:43 */
export const formatDateTime = (value: DateInput): string =>
  toDate(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

type ChatPerson = Pick<ChatSession, 'firstName' | 'lastName' | 'username' | 'telegramUserId'>;

/** 展示名：姓名优先，其次用户名，最后退回 Telegram 用户 id */
export const getChatName = ({
  firstName,
  lastName,
  username,
  telegramUserId,
}: ChatPerson): string =>
  [firstName, lastName].filter(Boolean).join(' ').trim() || username || telegramUserId;

/** 没有真实头像时按 Telegram 用户 id 固定选一种底色，同一个人始终一样 */
export const getAvatarTone = (telegramUserId: string): AvatarTone => {
  const sum = Array.from(telegramUserId).reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum % 2 === 0 ? 'red' : 'blue';
};
