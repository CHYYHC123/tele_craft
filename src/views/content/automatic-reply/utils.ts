import type { KeywordReplyRule } from '@/types/bot';

/** 按关键词模糊过滤（忽略大小写与首尾空格），空搜索返回全部 */
export const filterReplies = (replies: KeywordReplyRule[], search: string): KeywordReplyRule[] => {
  const query = search.trim().toLowerCase();
  if (!query) return replies;
  return replies.filter((item) => item.keywords.some((word) => word.toLowerCase().includes(query)));
};

/** 把输入框文本拆成关键词：按英文/中文逗号、换行切分，去首尾空格、去空项、忽略大小写去重 */
export const parseKeywords = (input: string): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of input.split(/[,，\n]/)) {
    const word = part.trim();
    const key = word.toLowerCase();
    if (!word || seen.has(key)) continue;
    seen.add(key);
    result.push(word);
  }
  return result;
};

/** 关键词数组转成展示/回填文本 */
export const formatKeywords = (keywords: string[]): string => keywords.join(', ');
