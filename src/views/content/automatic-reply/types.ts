export type ReplyTab = 'keyword' | 'receive';

/** 一条关键词自动回复规则 */
export interface KeywordReply {
  id: number;
  keywords: string;
  content: string;
}

export type KeywordReplyDraft = Omit<KeywordReply, 'id'>;

/** 弹窗模式：新增 / 编辑 / 只读详情 */
export type ReplyDialogMode = 'add' | 'edit' | 'details';
