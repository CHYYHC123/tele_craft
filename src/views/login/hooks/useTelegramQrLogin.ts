import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { createLoginSession, exchangeLoginSession, getLoginSession } from '@/api/auth';
import { useUserStore } from '@/store/user';
import type { LoginSessionStatus, TelegramProfile } from '@/types/auth';

/** 轮询间隔（毫秒） */
export const POLL_INTERVAL = 2000;

export type QrLoginStatus = LoginSessionStatus | 'loading' | 'error';

interface QrLogin {
  /** 二维码内容；会话未就绪时为 null */
  deepLink: string | null;
  status: QrLoginStatus;
  /** 已扫码、尚未确认的 Telegram 用户 */
  scannedBy: TelegramProfile | null;
  /** 重新创建登录会话 */
  refresh: () => void;
}

/**
 * 扫码登录：创建会话 → 轮询 → confirmed 后用 clientSecret 兑换 accessToken。
 * clientSecret 只留在内存（react-query 缓存里的会话数据），不进二维码、不落存储。
 * 会话过期或兑换失败会自动重新创建会话。
 */
export const useTelegramQrLogin = (): QrLogin => {
  const navigate = useNavigate();
  const setAuth = useUserStore((s) => s.setAuth);
  const [attempt, setAttempt] = useState(0);
  const exchangedToken = useRef<string | null>(null);

  const refresh = () => setAttempt((n) => n + 1);

  // 每次 attempt 变化都创建一个新会话；同 key 不重复请求（StrictMode 下也只发一次）
  const sessionQuery = useQuery({
    queryKey: ['telegram-login', 'session', attempt],
    queryFn: createLoginSession,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const session = sessionQuery.data;

  const stateQuery = useQuery({
    queryKey: ['telegram-login', 'state', session?.token],
    queryFn: async () => {
      const state = await getLoginSession(session!.token);
      // 会话过期后自动换一个新的二维码
      if (state.status === 'expired') setAttempt((n) => n + 1);
      return state;
    },
    enabled: Boolean(session),
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'confirmed' || status === 'expired' ? false : POLL_INTERVAL;
    },
  });
  const polledStatus = stateQuery.data?.status;

  const exchange = useMutation({
    mutationFn: (s: { token: string; clientSecret: string }) =>
      exchangeLoginSession(s.token, s.clientSecret),
    onSuccess: (result) => {
      setAuth(result);
      toast.success('Logged in');
      navigate('/', { replace: true });
    },
    // 401 / 409 等：会话已不可用，重新生成二维码（错误提示已由请求层弹出）
    onError: () => setAttempt((n) => n + 1),
  });
  const { mutate: exchangeSession } = exchange;

  // confirmed 后只兑换一次（同一会话只能兑换一次）
  useEffect(() => {
    if (polledStatus !== 'confirmed' || !session) return;
    if (exchangedToken.current === session.token) return;
    exchangedToken.current = session.token;
    exchangeSession({ token: session.token, clientSecret: session.clientSecret });
  }, [polledStatus, session, exchangeSession]);

  let status: QrLoginStatus;
  if (sessionQuery.isError) status = 'error';
  else if (!session) status = 'loading';
  else if (exchange.isPending || exchange.isSuccess) status = 'confirmed';
  else status = polledStatus ?? 'pending';

  return {
    deepLink: session?.deepLink ?? null,
    status,
    scannedBy: stateQuery.data?.scannedBy ?? null,
    refresh,
  };
};
