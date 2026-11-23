import { http } from 'msw';
import { describe, it, expect } from 'vitest';
import { addBot, getBots } from '@/api/bot';
import { apiFail, apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useUserStore } from '@/store/user';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';

const login = () =>
  useUserStore.getState().setAuth({
    accessToken: 'jwt-bot',
    expiresIn: 60,
    user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
  });

describe('api/bot', () => {
  afterEach(() => useUserStore.getState().logout());

  it('getBots：带 Bearer 并解包为数组，没有 Bot 时是空数组', async () => {
    login();
    let authorization: string | null = null;
    server.use(
      http.get(`${API}/bots`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return apiOk([]);
      }),
    );
    await expect(getBots()).resolves.toEqual([]);
    expect(authorization).toBe('Bearer jwt-bot');
  });

  it('addBot：请求体是 { token }，返回新增的 Bot', async () => {
    login();
    let body: unknown;
    server.use(
      http.post(`${API}/bots`, async ({ request }) => {
        body = await request.json();
        return apiOk({ id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'Shop' });
      }),
    );
    const bot = await addBot({ token: '7:ABC' });
    expect(body).toEqual({ token: '7:ABC' });
    expect(bot.displayName).toBe('Shop');
  });

  it('addBot：Bot 已被其他账号绑定（409）时 reject', async () => {
    login();
    server.use(http.post(`${API}/bots`, () => apiFail('1010', '已被绑定', 409)));
    await expect(addBot({ token: '7:ABC' })).rejects.toThrow();
  });
});
