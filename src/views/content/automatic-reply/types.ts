import type { KeywordReplyParams } from '@/types/bot';

export type ReplyTab = 'keyword' | 'receive';

/** 新增/修改时提交的草稿 */
export type KeywordReplyDraft = KeywordReplyParams;

/** 弹窗模式：新增 / 编辑 / 只读详情 */
export type ReplyDialogMode = 'add' | 'edit' | 'details';
