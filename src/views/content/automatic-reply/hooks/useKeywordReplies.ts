import { useState } from 'react';

import { useAddKeywordReply, useDeleteKeywordReply, useUpdateKeywordReply } from '@/hooks/useBots';
import type { KeywordReplyRule } from '@/types/bot';
import type { KeywordReplyDraft } from '@/views/content/automatic-reply/types';
import { filterReplies } from '@/views/content/automatic-reply/utils';

/** 关键词回复列表（本地搜索）+ 增删改；列表数据来自服务端，成功后由 mutation 更新缓存 */
export const useKeywordReplies = (botId: string, replies: KeywordReplyRule[]) => {
  const [search, setSearch] = useState('');
  const add = useAddKeywordReply(botId);
  const update = useUpdateKeywordReply(botId);
  const remove = useDeleteKeywordReply(botId);

  const addReply = (draft: KeywordReplyDraft, onSuccess?: () => void) =>
    add.mutate(draft, { onSuccess });

  const updateReply = (replyId: string, draft: KeywordReplyDraft, onSuccess?: () => void) =>
    update.mutate({ replyId, ...draft }, { onSuccess });

  const removeReply = (replyId: string) => remove.mutate(replyId);

  return {
    replies: filterReplies(replies, search),
    search,
    setSearch,
    addReply,
    updateReply,
    removeReply,
    isSaving: add.isPending || update.isPending,
    isRemoving: remove.isPending,
  };
};
