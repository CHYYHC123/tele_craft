import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';
import { login } from '@/api/auth';
import { server } from '@/mocks/server';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';

describe('api/auth login', () => {
  it('成功时返回 token 和 user（走默认 mock handler）', async () => {
    const res = await login({ username: 'ada', password: '123456' });
    expect(res.token).toBe('mock-token-123456');
    expect(res.user.name).toBe('ada');
  });

  it('接口报错时 reject（临时覆盖 handler）', async () => {
    server.use(
      http.post(`${API}/login`, () =>
        HttpResponse.json({ message: '账号被锁定' }, { status: 403 }),
      ),
    );
    await expect(login({ username: 'ada', password: 'x' })).rejects.toThrow();
  });
});
