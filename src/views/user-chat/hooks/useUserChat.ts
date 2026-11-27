import { useEffect, useState } from 'react';

import { useBotsQuery } from '@/hooks/useBots';
import { useChatsQuery, useUpdateChatStatus } from '@/hooks/useChats';
import { useBotStore } from '@/store/bot';
import type { ChatCounts, ChatSession, ChatStatus } from '@/types/chat';
import { resolveCurrentBot } from '@/utils/bot';
import { CHAT_LIST_PAGE_SIZE, CHAT_SEARCH_DEBOUNCE_MS } from '@/views/user-chat/constants';

const EMPTY_COUNTS: ChatCounts = { open: 0, muted: 0, closed: 0 };
const EMPTY_CHATS: ChatSession[] = [];

/** 聊天页：当前 Bot、分组筛选、搜索（防抖）、会话列表与选中会话 */
export const useUserChat = () => {
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { data: bots = [], isPending: isBotsPending } = useBotsQuery();
  const bot = resolveCurrentBot(bots, selectedBotId);

  const [folder, setFolderState] = useState<ChatStatus>('open');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  // 选中的会话存一份快照：搜索词把它从列表里筛掉时，右侧聊天不应该跟着消失。
  // 记下所属 Bot，切换 Bot 后旧会话自然视为未选中
  const [selection, setSelection] = useState<{ botId: string; chat: ChatSession } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search.trim()), CHAT_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const botId = bot?.id;
  const selected = selection && selection.botId === botId ? selection.chat : null;
  const setSelected = (chat: ChatSession | null) =>
    setSelection(chat && botId ? { botId, chat } : null);

  const query = useChatsQuery(botId, {
    status: folder,
    q: keyword || undefined,
    pageSize: CHAT_LIST_PAGE_SIZE,
  });
  const updateStatus = useUpdateChatStatus(botId);

  const setFolder = (next: ChatStatus) => {
    setFolderState(next);
    setSelected(null);
    setSearch('');
    setKeyword('');
  };

  /** 修改状态后会话离开当前分组，右侧回到 "Please select chat" */
  const changeStatus = (chatId: string, status: ChatStatus) => {
    updateStatus.mutate({ chatId, status }, { onSuccess: () => setSelected(null) });
  };

  return {
    bot,
    folder,
    setFolder,
    counts: query.data?.counts ?? EMPTY_COUNTS,
    search,
    setSearch,
    chats: query.data?.items ?? EMPTY_CHATS,
    isLoading: isBotsPending || (!!botId && query.isPending),
    selected,
    selectChat: setSelected,
    changeStatus,
  };
};
