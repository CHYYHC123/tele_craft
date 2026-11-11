import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useUserStore } from '@/store/user';
import type {
  TelegramLoginApi,
  TelegramLoginOptions,
  TelegramLoginResult,
  TelegramUser,
} from '@/types/telegram';
import type { User } from '@/types/user';

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
    const next = typeof url === 'string' ? appendTelegramOrigin(url) : url;
    return nativeOpen.call(window, next, target, features);
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

function readClientId(): number | null {
  const raw = (import.meta.env.VITE_TELEGRAM_CLIENT_ID ?? '').trim();
  const clientId = Number(raw);
  if (!raw || !Number.isSafeInteger(clientId) || clientId <= 0) return null;
  return clientId;
}

function toUser(telegramUser: TelegramUser): User | null {
  const id = telegramUser.id ?? telegramUser.sub;
  if (id === undefined || id === '') return null;
  const name = telegramUser.name?.trim() || telegramUser.preferred_username || 'Telegram user';
  return { id: String(id), name, avatar: telegramUser.picture };
}

/**
 * 用官方 Telegram Login SDK 打开登录弹窗。
 * id_token 先写入本地登录态；上线前必须由服务端验签后再信任。
 */
export const useTelegramLogin = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const setToken = useUserStore((s) => s.setToken);
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

  const login = () => {
    const clientId = readClientId();
    if (!clientId) {
      toast.error('Set VITE_TELEGRAM_CLIENT_ID before logging in with Telegram');
      return;
    }

    const api = window.Telegram?.Login;
    if (!api) {
      toast.error('Telegram login is still loading');
      return;
    }

    const nonce = crypto.randomUUID();
    setPending(true);
    try {
      openTelegramAuth(
        api,
        { client_id: clientId, scope: ['profile'], lang: 'en', nonce },
        (result: TelegramLoginResult) => {
          setPending(false);
          if (result.error) {
            if (result.error !== 'popup_closed') toast.error('Telegram login failed');
            return;
          }

          const user = result.user && result.user.nonce === nonce ? toUser(result.user) : null;
          if (!result.id_token || !user) {
            toast.error('Telegram login failed');
            return;
          }

          setToken(result.id_token);
          setUser(user);
          toast.success('Logged in');
          navigate('/');
        },
      );
    } catch {
      setPending(false);
      toast.error('Telegram login failed');
    }
  };

  return { login, ready, pending };
};
