import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { selectIsLoggedIn, useUserStore } from '@/store/user';
import type { AuthResult } from '@/types/auth';

const auth: AuthResult = {
  accessToken: 'abc',
  expiresIn: 60,
  user: { id: 'u1', telegramId: '123', firstName: 'Ada', lastName: 'L', username: 'ada' },
};

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.getState().logout();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态为空', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(selectIsLoggedIn(state)).toBe(false);
  });

  it('setAuth 写入 token、user 与过期时间', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    useUserStore.getState().setAuth(auth);

    const state = useUserStore.getState();
    expect(state.token).toBe('abc');
    expect(state.user).toEqual(auth.user);
    expect(state.expiresAt).toBe(1_000_000 + 60_000);
    expect(selectIsLoggedIn(state)).toBe(true);
  });

  it('超过 expiresIn 后不再视为已登录', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    useUserStore.getState().setAuth(auth);
    vi.setSystemTime(61_000);
    expect(selectIsLoggedIn(useUserStore.getState())).toBe(false);
  });

  it('logout 清空登录态', () => {
    useUserStore.getState().setAuth(auth);
    useUserStore.getState().logout();
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.expiresAt).toBeNull();
  });

  it('登录态会持久化到 localStorage', () => {
    useUserStore.getState().setAuth(auth);
    const saved = JSON.parse(localStorage.getItem('telecraft-auth') ?? '{}');
    expect(saved.state.token).toBe('abc');
  });
});
