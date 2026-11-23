import type { User } from '@/types/user';

/** 创建扫码登录会话的返回 */
export interface LoginSession {
  /** 22 位口令，用于轮询与兑换 */
  token: string;
  /** 给用户在 Telegram 中打开的链接，也是二维码内容 */
  deepLink: string;
  expiresAt: string;
  /** 只留在浏览器，兑换时提交，不要放进二维码 */
  clientSecret: string;
}

export type LoginSessionStatus = 'pending' | 'scanned' | 'confirmed' | 'expired';

/** Telegram 资料（不是登录凭证）。没有的名字或用户名是空字符串，id 为字符串 */
export interface TelegramProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

/** 轮询登录会话的返回 */
export interface LoginSessionState {
  status: LoginSessionStatus;
  scannedBy: TelegramProfile | null;
  user: TelegramProfile | null;
}

/** 扫码兑换 / 弹窗登录成功后的返回（两者结构相同） */
export interface AuthResult {
  accessToken: string;
  /** 单位：秒 */
  expiresIn: number;
  user: User;
}

/** 弹窗登录：领取到的一次性 nonce 与 Client ID */
export interface SdkNonce {
  nonce: string;
  clientId: string;
  expiresAt: string;
}
