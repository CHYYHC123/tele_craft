import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import {
  getChatMessages,
  getChatSubscriber,
  getChats,
  markChatRead,
  sendChatMessage,
  updateChatStatus,
  uploadChatImage,
} from '@/api/chat';
import type { ChatMessage, ChatMessagePage, ChatSessionsParams, ChatStatus } from '@/types/chat';
import { appendOlderMessages, mergeNewerMessages } from '@/utils/chat';

/** 会话列表与消息区的轮询间隔（接口建议 3 到 5 秒） */
const CHAT_POLL_INTERVAL_MS = 4000;
/** afterId 一次最多拉 100 条；积压很多时最多连续补几页，防止死循环 */
const MAX_CATCH_UP_PAGES = 5;

export const chatsQueryKey = (botId: string | undefined, params: ChatSessionsParams) =>
  ['bots', botId, 'chats', 'list', params] as const;
/** 某个 Bot 下所有会话列表（不分状态/搜索词）的前缀，用来批量失效 */
export const chatsListQueryKey = (botId: string | undefined) =>
  ['bots', botId, 'chats', 'list'] as const;
export const chatSubscriberQueryKey = (botId: string | undefined, chatId: string | undefined) =>
  ['bots', botId, 'chats', 'subscriber', chatId] as const;
export const chatMessagesQueryKey = (botId: string | undefined, chatId: string | undefined) =>
  ['bots', botId, 'chats', 'messages', chatId] as const;

/** 会话列表（状态筛选 + 搜索 + 分页）；轮询以便及时看到新消息与未读数，切换筛选时保留上一份数据 */
export const useChatsQuery = (botId: string | undefined, params: ChatSessionsParams) =>
  useQuery({
    queryKey: chatsQueryKey(botId, params),
    queryFn: () => getChats(botId as string, params),
    enabled: !!botId,
    placeholderData: keepPreviousData,
    refetchInterval: CHAT_POLL_INTERVAL_MS,
  });

/** 聊天对象资料；没有选中会话时不请求 */
export const useChatSubscriberQuery = (botId: string | undefined, chatId: string | undefined) =>
  useQuery({
    queryKey: chatSubscriberQueryKey(botId, chatId),
    queryFn: () => getChatSubscriber(botId as string, chatId as string),
    enabled: !!botId && !!chatId,
  });

/**
 * 拉取消息：缓存里还没有时取最新一页；已有时只用 afterId 拉比最新一条更新的消息并并入缓存，
 * 这样轮询不会重复下载已有消息，也不会丢掉用户已经翻出来的历史。
 */
const fetchChatMessages = async (
  queryClient: QueryClient,
  botId: string,
  chatId: string,
): Promise<ChatMessagePage> => {
  const queryKey = chatMessagesQueryKey(botId, chatId);
  const cached = queryClient.getQueryData<ChatMessagePage>(queryKey);
  const newest = cached?.items[0];
  if (!cached || !newest) return getChatMessages(botId, chatId);

  const fresh: ChatMessage[] = [];
  let cursor = newest.id;
  for (let i = 0; i < MAX_CATCH_UP_PAGES; i += 1) {
    const page = await getChatMessages(botId, chatId, { afterId: cursor, limit: 100 });
    fresh.push(...page.items);
    const last = page.items.at(-1);
    if (!page.hasMore || !last) break;
    cursor = last.id;
  }
  // 请求期间缓存可能被「发送成功」「翻历史」更新过，合并时以最新缓存为准
  return mergeNewerMessages(queryClient.getQueryData<ChatMessagePage>(queryKey) ?? cached, fresh);
};

/** 聊天消息（items 新的在前，hasMore 表示还有更早的历史）；轮询拉新消息 */
export const useChatMessagesQuery = (botId: string | undefined, chatId: string | undefined) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: chatMessagesQueryKey(botId, chatId),
    queryFn: () => fetchChatMessages(queryClient, botId as string, chatId as string),
    enabled: !!botId && !!chatId,
    refetchInterval: CHAT_POLL_INTERVAL_MS,
  });
};

/** 翻更早的历史：成功后并到缓存末尾，并更新 hasMore */
export const useLoadOlderChatMessages = (botId: string | undefined, chatId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (before: string) => getChatMessages(botId as string, chatId as string, { before }),
    onSuccess: (older) => {
      queryClient.setQueryData<ChatMessagePage>(chatMessagesQueryKey(botId, chatId), (old) =>
        old ? appendOlderMessages(old, older) : old,
      );
    },
  });
};

/** 修改会话状态：成功后刷新所有会话列表（分组与计数都会变）和这个会话的资料 */
export const useUpdateChatStatus = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, status }: { chatId: string; status: ChatStatus }) =>
      updateChatStatus(botId as string, chatId, status),
    onSuccess: async (_result, { chatId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatsListQueryKey(botId) }),
        queryClient.invalidateQueries({ queryKey: chatSubscriberQueryKey(botId, chatId) }),
      ]);
    },
  });
};

/** 标记会话已读：成功后刷新会话列表，未读数清零 */
export const useMarkChatRead = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => markChatRead(botId as string, chatId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatsListQueryKey(botId) }),
  });
};

export interface SendChatVariables {
  /** 文本消息的正文；带 file 时是图注，可为空串 */
  text: string;
  /** 有值时发送图片消息：先上传再发送 */
  file?: File;
}

/**
 * 以 Bot 身份发送文本或图片。成功后把返回的消息并入消息缓存（不用等下一次轮询），
 * 并刷新会话列表（最后一条消息与排序都会变）。错误由请求拦截器统一 toast。
 */
export const useSendChatMessage = (botId: string | undefined, chatId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, file }: SendChatVariables) => {
      const clientMessageId = `c-${crypto.randomUUID()}`;
      if (!file) {
        return sendChatMessage(botId as string, chatId as string, {
          type: 'text',
          text,
          clientMessageId,
        });
      }
      const image = await uploadChatImage(botId as string, file);
      const caption = text.trim();
      return sendChatMessage(botId as string, chatId as string, {
        type: 'image',
        ...image,
        ...(caption ? { text: caption } : {}),
        clientMessageId,
      });
    },
    onSuccess: (message) => {
      const messagesKey = chatMessagesQueryKey(botId, chatId);
      queryClient.setQueryData<ChatMessagePage>(messagesKey, (old) =>
        old ? mergeNewerMessages(old, [message]) : old,
      );
      // 消息还在首次加载时缓存是空的，回写会落空；失效一次让进行中的请求重新拉，保证不丢这条
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: messagesKey }),
        queryClient.invalidateQueries({ queryKey: chatsListQueryKey(botId) }),
      ]);
    },
  });
};
