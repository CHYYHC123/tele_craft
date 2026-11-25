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

/** Bot 欢迎语（点 Start 前展示的 Description）；null 表示尚未配置 */
export interface BotWelcome {
  description: string | null;
}

/** 开场消息里的操作按钮 */
export interface StartMessageButton {
  name: string;
  url: string;
}

/**
 * Bot 开场消息：用户点 Start 之后 bot 回发的图文或纯文本（不是点 Start 之前的 Description，那是 BotWelcome）。
 * 未配置过时服务端返回空模板；buttonsEnabled 为 false 时按钮仍会返回。
 */
export interface StartMessage {
  messageType: 'text' | 'graphic';
  imageUrl: string | null;
  /** 最长 1024，只允许 b、i、a、br 标签 */
  description: string;
  buttonsEnabled: boolean;
  buttons: StartMessageButton[];
}

/** 保存并发布开场消息的请求体；messageType 为 text 时服务端会清掉图片 */
export interface UpdateStartMessageParams {
  messageType: StartMessage['messageType'];
  /** graphic 必填：上传接口返回的地址，或当前已发布的地址 */
  imageUrl: string | null;
  /** 最长 1024，只允许 b、i、a、br 标签 */
  description: string;
  buttonsEnabled: boolean;
  buttons: StartMessageButton[];
}

/** 上传开场消息配图的返回：只有公网地址，不会改动已发布的消息 */
export interface StartMessageImage {
  imageUrl: string;
}

/** 两个字段都可选，但至少传一个；只传发生变化的字段 */
export interface UpdateBotParams {
  /** 显示名，1-64 个字符 */
  displayName?: string;
  /** About 简介，最长 120 个字符，传空字符串可清空 */
  shortDescription?: string;
}
