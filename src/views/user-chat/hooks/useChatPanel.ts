import { useEffect } from 'react';

import {
  useChatMessagesQuery,
  useChatSubscriberQuery,
  useLoadOlderChatMessages,
  useMarkChatRead,
  useSendChatMessage,
} from '@/hooks/useChats';
import type { ChatMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];

/** 右侧聊天区：消息（轮询）、历史翻页、聊天对象资料、发送，以及打开/收到新消息时标记已读 */
export const useChatPanel = (botId: string, chatId: string) => {
  const messagesQuery = useChatMessagesQuery(botId, chatId);
  const subscriberQuery = useChatSubscriberQuery(botId, chatId);
  const loadOlder = useLoadOlderChatMessages(botId, chatId);
  const markRead = useMarkChatRead(botId);
  const sender = useSendChatMessage(botId, chatId);

  // 缓存里新的在前，展示时反转成旧的在前
  const items = messagesQuery.data?.items ?? EMPTY_MESSAGES;
  const messages = items.length > 1 ? [...items].reverse() : items;
  const isLoaded = messagesQuery.isSuccess;
  const latestIncomingId = items.find((item) => item.direction === 'in')?.id;

  // 会话加载完成时标记一次已读；窗口开着时用户又发来新消息，再标记一次
  const { mutate: markChatRead } = markRead;
  useEffect(() => {
    if (isLoaded) markChatRead(chatId);
  }, [chatId, isLoaded, latestIncomingId, markChatRead]);

  const oldest = items.at(-1);

  return {
    messages,
    isLoading: messagesQuery.isPending,
    hasMore: messagesQuery.data?.hasMore ?? false,
    isLoadingOlder: loadOlder.isPending,
    loadOlder: () => {
      if (oldest && !loadOlder.isPending) loadOlder.mutate(oldest.id);
    },
    subscriber: subscriberQuery.data,
    isSending: sender.isPending,
    /** 发送失败会 reject（错误已由请求拦截器 toast），调用方据此决定是否保留输入 */
    send: async (text: string, file?: File) => {
      await sender.mutateAsync({ text, file });
    },
  };
};
