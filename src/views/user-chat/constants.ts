import type { ChatStatus } from '@/types/chat';

export const FOLDER_OPTIONS: { value: ChatStatus; label: string }[] = [
  { value: 'open', label: 'Open chats' },
  { value: 'muted', label: 'Muted chats' },
  { value: 'closed', label: 'Closed chats' },
];

export const COMPOSER_PLACEHOLDER = 'Type # to add a saved reply...';
export const COMPOSER_BLOCKED_PLACEHOLDER = 'This user has blocked the bot';

/** 会话列表搜索防抖 */
export const CHAT_SEARCH_DEBOUNCE_MS = 300;
/** 会话列表一次取的条数（接口上限 100，侧栏暂不分页） */
export const CHAT_LIST_PAGE_SIZE = 100;

/** 聊天图片：与上传接口约束一致，只支持 PNG/JPG，不超过 2MB */
export const CHAT_IMAGE_TYPES = ['image/png', 'image/jpeg'];
export const CHAT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const CHAT_IMAGE_ERROR = 'Only PNG/JPG images up to 2MB are supported';
