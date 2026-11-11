/** Telegram Login SDK：https://oauth.telegram.org/js/telegram-login.js */
export interface TelegramLoginOptions {
  client_id: number;
  scope?: Array<'profile' | 'phone' | 'write'>;
  lang?: string;
  nonce?: string;
}

/** SDK 解码后的 id_token 载荷，签名仍需服务端校验 */
export interface TelegramUser {
  id?: number;
  sub?: string;
  name?: string;
  preferred_username?: string;
  picture?: string;
  nonce?: string;
}

export interface TelegramLoginResult {
  id_token?: string;
  user?: TelegramUser;
  error?: string;
}

export interface TelegramLoginApi {
  init: (options: TelegramLoginOptions, callback?: (result: TelegramLoginResult) => void) => void;
  open: (callback?: (result: TelegramLoginResult) => void) => void;
  auth: (options: TelegramLoginOptions, callback?: (result: TelegramLoginResult) => void) => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      Login?: TelegramLoginApi;
    };
  }
}
