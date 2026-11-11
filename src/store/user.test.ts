import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/store/user';
import type { User } from '@/types/user';

const mockUser: User = { id: '1', name: 'Ada' };

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.getState().logout();
  });

  it('初始状态为空', () => {
    const { user, token } = useUserStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('setUser / setToken 写入状态', () => {
    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().setToken('abc');
    expect(useUserStore.getState().user).toEqual(mockUser);
    expect(useUserStore.getState().token).toBe('abc');
  });

  it('logout 清空登录态', () => {
    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().setToken('abc');
    useUserStore.getState().logout();
    expect(useUserStore.getState().user).toBeNull();
    expect(useUserStore.getState().token).toBeNull();
  });
});
