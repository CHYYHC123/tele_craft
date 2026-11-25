import type { ReplyTab } from '@/views/content/automatic-reply/types';

export const REPLY_TABS: { value: ReplyTab; label: string }[] = [
  { value: 'keyword', label: 'Keyword reply' },
  { value: 'receive', label: 'Receive message reply' },
];

export const REPLY_CONTENT_MAX_LENGTH = 370;

/** 一条关键词回复最多包含的关键词数 */
export const KEYWORD_MAX_COUNT = 10;
