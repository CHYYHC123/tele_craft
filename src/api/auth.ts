import { http } from '@/api/request';
import type { AuthResult, LoginSession, LoginSessionState, SdkNonce } from '@/types/auth';

/** 创建扫码登录会话（没有请求体） */
export const createLoginSession = () => http.post<LoginSession>('/auth/telegram/sessions');

/** 查询登录会话进度；会话不存在或已过期时 HTTP 仍是 200，status 为 expired。轮询请求不弹全局错误 */
export const getLoginSession = (token: string) =>
  http.get<LoginSessionState>(`/auth/telegram/sessions/${token}`, { silent: true });

/** 扫码确认后，用创建会话时的 clientSecret 换取 accessToken（同一会话只能兑换一次） */
export const exchangeLoginSession = (token: string, clientSecret: string) =>
  http.post<AuthResult>(`/auth/telegram/sessions/${token}/exchange`, { clientSecret });

/** 退出登录：让当前 accessToken 立即失效（没有请求体）。本地登录态由调用方清理，失败不弹全局错误 */
export const logout = () => http.post<null>('/auth/logout', undefined, { silent: true });

/** 弹窗登录：领取一次性 nonce 与 Client ID */
export const getSdkNonce = () => http.post<SdkNonce>('/auth/telegram/sdk/nonce');

/** 弹窗登录：把 Telegram 回调里的 id_token 交给后端验证，换取 accessToken */
export const loginWithSdk = (idToken: string) =>
  http.post<AuthResult>('/auth/telegram/sdk/login', { idToken });
