/** 会话状态：进行中 / 已静音 / 已关闭；一个会话同一时间只有一个状态 */
export type ChatStatus = 'open' | 'muted' | 'closed';

/** 会话列表的一项（只包含接入聊天功能之后有过消息的用户）；时间为 ISO 8601 */
export interface ChatSession {
  /** 会话 id（UUID），其它聊天接口的 subscriberId */
  id: string;
  telegramUserId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  status: ChatStatus;
  /** 纯文本；图片消息没有图注时为 [图片] */
  lastMessagePreview: string;
  lastMessageAt: string;
  /** 最后一次「标记已读」之后用户发来的消息数 */
  unreadCount: number;
}

/** 三个状态各自的会话总数，不受 status 和 q 影响 */
export type ChatCounts = Record<ChatStatus, number>;

export interface ChatSessionsParams {
  /** 默认 open */
  status?: ChatStatus;
  /** 搜索词，匹配姓名或用户名 */
  q?: string;
  /** 页码，从 1 开始 */
  page?: number;
  /** 默认 20，最大 100 */
  pageSize?: number;
}

export interface ChatSessionPage {
  items: ChatSession[];
  page: number;
  pageSize: number;
  total: number;
  counts: ChatCounts;
}

/** 当前正在聊天的 Telegram 用户资料 */
export interface ChatSubscriber {
  id: string;
  telegramUserId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  /** 多数时候是 null，只有用户主动分享联系人才有值 */
  phone: string | null;
  firstSeenAt: string;
  lastActiveAt: string;
  /** 不为 null 表示用户已屏蔽 Bot，此时发消息会失败；用户再次发消息后恢复为 null */
  unsubscribedAt: string | null;
  status: ChatStatus;
}

/** in 为用户发来，out 为 Bot 发出 */
export type ChatMessageDirection = 'in' | 'out';

/** 消息来源：operator 是在聊天页发送的 */
export type ChatMessageSource = 'user' | 'operator' | 'auto' | 'menu' | 'keyboard' | 'start';

export interface ChatMessage {
  id: string;
  direction: ChatMessageDirection;
  source: ChatMessageSource;
  messageType: 'text' | 'image';
  /** image 类型时是图注，可能为空串 */
  text: string;
  /** 用户发来的图片保存失败时为 null */
  imageUrl: string | null;
  telegramMessageId: number;
  clientMessageId: string | null;
  createdAt: string;
}

/**
 * 查询聊天消息的游标：不传时返回最新一页；before 翻更早的历史；afterId 拉取新消息。
 * before 和 afterId 不能同时传。
 */
export interface ChatMessagesParams {
  before?: string;
  afterId?: string;
  /** 默认 30，最大 100 */
  limit?: number;
}

/**
 * 不带游标和带 before 时 items 新的在前；带 afterId 时 items 旧的在前。
 * hasMore 表示同方向还有更多。
 */
export interface ChatMessagePage {
  items: ChatMessage[];
  hasMore: boolean;
}

/** 上传聊天图片的返回：发送图片消息时原样带上 */
export interface ChatImage {
  imageUrl: string;
  imagePath: string;
}

/** 发送文本消息 */
export interface SendTextMessageParams {
  type: 'text';
  /** 最长 4096，不能全是空白；纯文本原样发送，不解析 HTML */
  text: string;
  /** 前端生成的唯一 id，最长 64；同一个 id 重试不会重复发送 */
  clientMessageId?: string;
}

/** 发送图片消息：imageUrl、imagePath 来自「上传聊天图片」 */
export interface SendImageMessageParams {
  type: 'image';
  imageUrl: string;
  imagePath: string;
  /** 图注，可选，最长 1024 */
  text?: string;
  clientMessageId?: string;
}

export type SendChatMessageParams = SendTextMessageParams | SendImageMessageParams;

export interface ChatStatusResult {
  status: ChatStatus;
}

export interface ChatReadResult {
  readAt: string;
}
