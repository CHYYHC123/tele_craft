import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResult } from '@/types/auth';
import type { User } from '@/types/user';

interface UserState {
  user: User | null;
  token: string | null;
  /** accessToken 过期时间（毫秒时间戳） */
  expiresAt: number | null;
  /** 写入登录结果：扫码兑换与弹窗登录共用 */
  setAuth: (result: AuthResult) => void;
  logout: () => void;
}

type PersistedUserState = Pick<UserState, 'user' | 'token' | 'expiresAt'>;

const EMPTY_AUTH: PersistedUserState = { user: null, token: null, expiresAt: null };

/** 是否处于有效登录态（有 token 且未过期） */
export const selectIsLoggedIn = (state: PersistedUserState): boolean =>
  Boolean(state.token) && state.expiresAt !== null && state.expiresAt > Date.now();

/** 客户端全局用户状态（跨页面共享的客户端状态才放这里），持久化到 localStorage */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...EMPTY_AUTH,
      setAuth: ({ accessToken, expiresIn, user }) =>
        set({ token: accessToken, user, expiresAt: Date.now() + expiresIn * 1000 }),
      logout: () => set(EMPTY_AUTH),
    }),
    {
      name: 'telecraft-auth',
      partialize: ({ user, token, expiresAt }): PersistedUserState => ({ user, token, expiresAt }),
      // 恢复时若已过期则直接丢弃
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedUserState> | undefined;
        const restored = { ...EMPTY_AUTH, ...saved };
        return { ...current, ...(selectIsLoggedIn(restored) ? restored : EMPTY_AUTH) };
      },
    },
  ),
);
