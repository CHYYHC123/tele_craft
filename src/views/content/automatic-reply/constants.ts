import type { KeywordReply, ReplyTab } from '@/views/content/automatic-reply/types';

export const REPLY_TABS: { value: ReplyTab; label: string }[] = [
  { value: 'keyword', label: 'Keyword reply' },
  { value: 'receive', label: 'Receive message reply' },
];

export const REPLY_CONTENT_MAX_LENGTH = 370;

export const DEFAULT_REPLY_CONTENT =
  "Hi, welcome to our support bot. Please type your questions here, we'll reply as soon as we can!";

export const DEFAULT_RECEIVE_REPLY_CONTENT =
  "Thanks for your message! Our team is currently away, we'll get back to you as soon as we can.";

export const INITIAL_KEYWORD_REPLIES: KeywordReply[] = [
  { id: 1, keywords: 'Hello', content: DEFAULT_REPLY_CONTENT },
  { id: 2, keywords: 'Hi', content: DEFAULT_REPLY_CONTENT },
  { id: 3, keywords: 'Help', content: DEFAULT_REPLY_CONTENT },
];
