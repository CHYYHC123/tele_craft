/** 用户绑定的 Telegram Bot（响应永远不含 token） */
export interface Bot {
  id: string;
  telegramBotId: string;
  /** @ 后面的用户名 */
  username: string;
  /** Telegram 上的显示名 */
  displayName: string;
  /** Telegram 的 About（个人资料页简介），最长 120 字符；未设置时可能为空 */
  shortDescription?: string | null;
}

export interface AddBotParams {
  /** Bot 的 API token，形如 123456789:ABCdef... */
  token: string;
}

/** 首页四张统计卡；Change 为整数百分比，对比基数为 0 时是 null */
export interface BotStats {
  followersAll: number;
  followersAllChange: number | null;
  addedToday: number;
  addedTodayChange: number | null;
  activeToday: number;
  unsubscribedToday: number;
  unsubscribedTodayChange: number | null;
}

/** Bot 订阅者（私聊用户）；telegramUserId 是字符串，时间为 ISO 8601 */
export interface Subscriber {
  telegramUserId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  firstSeenAt: string;
  lastActiveAt: string;
}

export interface SubscribersParams {
  /** 搜索词，匹配 firstName 或 username */
  q?: string;
  /** 页码，从 1 开始 */
  page?: number;
  pageSize?: number;
}

export interface SubscriberPage {
  items: Subscriber[];
  page: number;
  pageSize: number;
  total: number;
}

/** 两个字段都可选，但至少传一个；只传发生变化的字段 */
export interface UpdateBotParams {
  /** 显示名，1-64 个字符 */
  displayName?: string;
  /** About 简介，最长 120 个字符，传空字符串可清空 */
  shortDescription?: string;
}
