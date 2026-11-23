import type { KeywordReply } from '@/views/content/automatic-reply/types';

/** 按关键词模糊过滤（忽略大小写与首尾空格），空搜索返回全部 */
export const filterReplies = (replies: KeywordReply[], search: string): KeywordReply[] => {
  const query = search.trim().toLowerCase();
  if (!query) return replies;
  return replies.filter((item) => item.keywords.toLowerCase().includes(query));
};
