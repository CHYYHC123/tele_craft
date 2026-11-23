import type { User } from '@/types/user';

type NameFields = Pick<User, 'firstName' | 'lastName' | 'username'>;

/** 展示名：优先姓名，其次 username，都没有时返回空字符串 */
export function getUserDisplayName(user: NameFields | null | undefined): string {
  if (!user) return '';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.username || '';
}
