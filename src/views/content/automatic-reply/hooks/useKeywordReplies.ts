import { useRef, useState } from 'react';

import { INITIAL_KEYWORD_REPLIES } from '@/views/content/automatic-reply/constants';
import type { KeywordReply, KeywordReplyDraft } from '@/views/content/automatic-reply/types';
import { filterReplies } from '@/views/content/automatic-reply/utils';

export const useKeywordReplies = () => {
  const [replies, setReplies] = useState<KeywordReply[]>(INITIAL_KEYWORD_REPLIES);
  const [search, setSearch] = useState('');
  const nextId = useRef(INITIAL_KEYWORD_REPLIES.length + 1);

  const addReply = (draft: KeywordReplyDraft) => {
    const id = nextId.current++;
    setReplies((prev) => [...prev, { id, ...draft }]);
  };

  const updateReply = (id: number, draft: KeywordReplyDraft) => {
    setReplies((prev) => prev.map((item) => (item.id === id ? { ...item, ...draft } : item)));
  };

  const removeReply = (id: number) => {
    setReplies((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    replies: filterReplies(replies, search),
    search,
    setSearch,
    addReply,
    updateReply,
    removeReply,
  };
};
