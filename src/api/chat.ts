import { http } from '@/api/request';
import type {
  ChatImage,
  ChatMessage,
  ChatMessagePage,
  ChatMessagesParams,
  ChatReadResult,
  ChatSessionPage,
  ChatSessionsParams,
  ChatStatus,
  ChatStatusResult,
  ChatSubscriber,
  SendChatMessageParams,
} from '@/types/chat';

/** 会话列表：按状态筛选，按最后一条消息时间倒序；没有会话时 items 是空数组 */
export const getChats = (botId: string, params: ChatSessionsParams = {}) =>
  http.get<ChatSessionPage>(`/bots/${botId}/chats`, { params });

/** 聊天对象信息：当前会话的 Telegram 用户资料 */
export const getChatSubscriber = (botId: string, chatId: string) =>
  http.get<ChatSubscriber>(`/bots/${botId}/chats/${chatId}`);

/** 修改会话状态：open / muted / closed；静音只影响列表分组，不影响自动回复 */
export const updateChatStatus = (botId: string, chatId: string, status: ChatStatus) =>
  http.patch<ChatStatusResult>(`/bots/${botId}/chats/${chatId}/status`, { status });

/**
 * 查询聊天消息：不带游标返回最新一页（新的在前）；before 翻更早的历史（新的在前）；
 * afterId 拉取新消息（旧的在前）。before 与 afterId 不能同时传。
 */
export const getChatMessages = (botId: string, chatId: string, params: ChatMessagesParams = {}) =>
  http.get<ChatMessagePage>(`/bots/${botId}/chats/${chatId}/messages`, { params });

/** 上传聊天图片（PNG/JPG，≤2MB），multipart 字段名 file；发送图片消息时带上返回值 */
export const uploadChatImage = (botId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return http.post<ChatImage>(`/bots/${botId}/chats/image`, form);
};

/** 以 Bot 的身份发送文本或图片：先发给 Telegram，成功后才保存并返回这条消息 */
export const sendChatMessage = (botId: string, chatId: string, data: SendChatMessageParams) =>
  http.post<ChatMessage>(`/bots/${botId}/chats/${chatId}/messages`, data);

/** 标记会话已读：把未读数清零，打开一个会话时调用 */
export const markChatRead = (botId: string, chatId: string) =>
  http.put<ChatReadResult>(`/bots/${botId}/chats/${chatId}/read`);
