/** 用户绑定的 Telegram Bot（响应永远不含 token） */
export interface Bot {
  id: string;
  telegramBotId: string;
  /** @ 后面的用户名 */
  username: string;
  /** Telegram 上的显示名 */
  displayName: string;
}

export interface AddBotParams {
  /** Bot 的 API token，形如 123456789:ABCdef... */
  token: string;
}
