/** 平台用户。id 是平台用户 id，telegramId 是 Telegram 用户 id，二者都保持字符串 */
export interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
}
