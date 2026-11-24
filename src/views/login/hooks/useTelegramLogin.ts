import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { getSdkNonce, loginWithSdk } from '@/api/auth';
import { useUserStore } from '@/store/user';
import type { TelegramLoginApi, TelegramLoginOptions, TelegramLoginResult } from '@/types/telegram';

const TELEGRAM_LOGIN_SDK_SRC = 'https://oauth.telegram.org/js/telegram-login.js';
const TELEGRAM_LOGIN_SDK_ID = 'telegram-login-sdk';
const TELEGRAM_AUTH_ORIGIN = 'https://oauth.telegram.org';

/**
 * 官方 SDK 打开的 /auth 地址没有 origin，Telegram 会直接返回 “origin required”。
 * 在 window.open 之前补上当前页面的 origin。
 */
export function appendTelegramOrigin(url: string, origin = location.origin): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.origin !== TELEGRAM_AUTH_ORIGIN || parsed.pathname !== '/auth') return url;
  if (!parsed.searchParams.has('origin')) parsed.searchParams.set('origin', origin);
  return parsed.toString();
}

function openTelegramAuth(
  auth: TelegramLoginApi,
  options: TelegramLoginOptions,
  callback: (result: TelegramLoginResult) => void,
) {
  const nativeOpen = window.open;
  window.open = (url, target, features) => {
    // 临时验证：不再补 origin，使用官方 SDK 原始地址（OIDC 流程）。验证完成后据结果决定删除或恢复。
    console.log('[TG] window.open url', url);
    return nativeOpen.call(window, url, target, features);
  };
  try {
    auth.auth(options, callback);
  } finally {
    window.open = nativeOpen;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadTelegramLoginSdk(): Promise<void> {
  if (window.Telegram?.Login) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.Telegram?.Login) resolve();
      else reject(new Error('Telegram Login SDK missing'));
    };
    const fail = () => {
      sdkPromise = null;
      reject(new Error('Telegram Login SDK failed to load'));
    };

    const existing = document.getElementById(TELEGRAM_LOGIN_SDK_ID);
    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', fail, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TELEGRAM_LOGIN_SDK_ID;
    script.src = TELEGRAM_LOGIN_SDK_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => {
      script.remove();
      fail();
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

/**
 * 弹窗登录：先向后端领取一次性 nonce 与 Client ID，用官方 Telegram Login SDK 弹窗授权，
 * 再把回调里的 id_token 交给后端验证，换取 accessToken。
 * id_token 不是登录凭证；nonce 只能用一次，失败或取消后下次点击会重新领取。
 */
export const useTelegramLogin = () => {
  const navigate = useNavigate();
  const setAuth = useUserStore((s) => s.setAuth);
  const [ready, setReady] = useState(() => Boolean(window.Telegram?.Login));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadTelegramLoginSdk()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load Telegram login');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async () => {
    const api = window.Telegram?.Login;
    if (!api) {
      toast.error('Telegram login is still loading');
      return;
    }

    setPending(true);

    let nonce: string;
    let clientId: number;
    try {
      const sdkNonce = await getSdkNonce();
      nonce = sdkNonce.nonce;
      clientId = Number(sdkNonce.clientId);
    } catch {
      // 请求错误已由请求层统一提示
      setPending(false);
      return;
    }
    if (!Number.isSafeInteger(clientId) || clientId <= 0) {
      setPending(false);
      toast.error('Telegram login is not configured');
      return;
    }

    console.log('[TG] sdk params', { clientId, nonce, origin: location.origin });

    // 临时调试：打印授权弹窗回传的原始 postMessage（SDK 会把非字符串的 result 当成 missing id_token）
    const debugListener = (event: MessageEvent) => {
      if (event.origin !== TELEGRAM_AUTH_ORIGIN) return;
      let raw: unknown = event.data;
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw);
        } catch {
          // 保持原始字符串
        }
      }
      console.log('[TG] raw message from oauth.telegram.org', raw);
      console.log('[TG] raw message JSON', JSON.stringify(raw));
      console.log('[TG] raw.result typeof =', typeof (raw as { result?: unknown })?.result);
    };
    window.addEventListener('message', debugListener);
    window.setTimeout(() => window.removeEventListener('message', debugListener), 5 * 60_000);

    try {
      openTelegramAuth(
        api,
        { client_id: clientId, scope: ['profile'], lang: 'en', nonce },
        (result: TelegramLoginResult) => {
          void finishLogin(result, nonce);
        },
      );
    } catch (e) {
      console.error('[TG] openTelegramAuth threw', e);
      setPending(false);
      toast.error('Telegram login failed');
    }
  };

  const finishLogin = async (result: TelegramLoginResult, nonce: string) => {
    console.log('[TG] callback result', result);
    console.log('[TG] nonce compare', { local: nonce, fromTelegram: result.user?.nonce });
    try {
      if (result.error) {
        console.warn('[TG] result.error =', result.error);
        if (result.error !== 'popup_closed') toast.error('Telegram login failed');
        return;
      }
      if (!result.id_token) {
        console.warn('[TG] missing id_token', result);
        toast.error('Telegram login failed');
        return;
      }
      // 前端比对 nonce 只是体验上的检查，真正的校验在后端
      if (result.user?.nonce && result.user.nonce !== nonce) {
        console.warn('[TG] nonce mismatch', { local: nonce, remote: result.user.nonce });
        toast.error('Telegram login failed');
        return;
      }

      const auth = await loginWithSdk(result.id_token);
      setAuth(auth);
      // toast.success('Logged in');
      navigate('/', { replace: true });
    } catch (e) {
      console.error('[TG] loginWithSdk failed', e);
      // 请求错误已由请求层统一提示
    } finally {
      setPending(false);
    }
  };

  return { login, ready, pending };
};
