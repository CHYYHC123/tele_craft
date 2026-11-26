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

/** 一条关键词自动回复规则 */
export interface KeywordReplyRule {
  id: string;
  keywords: string[];
  content: string;
}

/**
 * Bot 自动回复：关键词开关、兜底（收到消息）回复和全部关键词规则。
 * 未配置时两个开关为 false、receiveContent 为空字符串、keywordReplies 为空数组。
 */
export interface AutoReply {
  keywordEnabled: boolean;
  receiveEnabled: boolean;
  receiveContent: string;
  /** 按创建时间从早到晚排列 */
  keywordReplies: KeywordReplyRule[];
}

/** 只更新提交的字段，至少传一个；兜底开关打开时正文不能为空 */
export type UpdateAutoReplyParams = Partial<
  Pick<AutoReply, 'keywordEnabled' | 'receiveEnabled' | 'receiveContent'>
>;

/** 新增/修改关键词回复的请求体；修改时 keywords 按这次提交整批替换 */
export interface KeywordReplyParams {
  /** 1-10 个，不能以 / 开头，同一条里不能重复（忽略大小写） */
  keywords: string[];
  content: string;
}

/** 上传开场消息配图的返回：只有公网地址，不会改动已发布的消息 */
export interface StartMessageImage {
  imageUrl: string;
}

/** 命令菜单里的操作按钮 */
export interface BotMenuButton {
  name: string;
  url: string;
}

/**
 * Bot 命令菜单的一项自定义命令（不含 /start，/start 由开场消息负责）。
 * command 不带斜杠；未配置过时列表是空数组。
 */
export interface BotMenu {
  id: string;
  /** 小写字母、数字、下划线，最长 32，不能是 start */
  command: string;
  /** 菜单里命令下方的一行说明，1 到 256 个字符 */
  commandDescription: string;
  messageType: 'graphic' | 'text' | 'link';
  imageUrl: string | null;
  /** 最长 1024，只允许 b、i、a、br；link 类型不保存正文 */
  description: string;
  /** link 类型的外链；其它类型为 null */
  linkUrl: string | null;
  buttonsEnabled: boolean;
  buttons: BotMenuButton[];
}

/** 新建/修改菜单的请求体；服务端会去掉 command 开头的 / 并转成小写 */
export type BotMenuParams = Omit<BotMenu, 'id'>;

/** 上传菜单配图的返回：只有公网地址，不会改动已发布的菜单 */
export interface BotMenuImage {
  imageUrl: string;
}

/** 两个字段都可选，但至少传一个；只传发生变化的字段 */
export interface UpdateBotParams {
  /** 显示名，1-64 个字符 */
  displayName?: string;
  /** About 简介，最长 120 个字符，传空字符串可清空 */
  shortDescription?: string;
}
