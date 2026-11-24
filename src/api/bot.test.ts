import { http } from 'msw';
import { describe, it, expect } from 'vitest';
import {
  addBot,
  exportBotSubscribers,
  getBotStats,
  getBotSubscribers,
  getBots,
  updateBot,
} from '@/api/bot';
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

  it('updateBot：PATCH /bots/:id，请求体是 { displayName }', async () => {
    login();
    let body: unknown;
    server.use(
      http.patch(`${API}/bots/b1`, async ({ request }) => {
        body = await request.json();
        return apiOk({ id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'New' });
      }),
    );
    const bot = await updateBot('b1', { displayName: 'New' });
    expect(body).toEqual({ displayName: 'New' });
    expect(bot.displayName).toBe('New');
  });

  it('updateBot：可只传 shortDescription，返回带简介的 Bot', async () => {
    login();
    let body: unknown;
    server.use(
      http.patch(`${API}/bots/b1`, async ({ request }) => {
        body = await request.json();
        return apiOk({
          id: 'b1',
          telegramBotId: '7',
          username: 'shop_bot',
          displayName: 'Shop',
          shortDescription: 'About me',
        });
      }),
    );
    const bot = await updateBot('b1', { shortDescription: 'About me' });
    expect(body).toEqual({ shortDescription: 'About me' });
    expect(bot.shortDescription).toBe('About me');
  });

  it('getBotStats：解包统计数据', async () => {
    login();
    server.use(
      http.get(`${API}/bots/b1/stats`, () =>
        apiOk({
          followersAll: 1,
          followersAllChange: null,
          addedToday: 2,
          addedTodayChange: 3,
          activeToday: 4,
          unsubscribedToday: 0,
          unsubscribedTodayChange: null,
        }),
      ),
    );
    await expect(getBotStats('b1')).resolves.toMatchObject({ followersAll: 1, activeToday: 4 });
  });

  it('getBotSubscribers：以查询参数传 q/page/pageSize', async () => {
    login();
    let search = '';
    server.use(
      http.get(`${API}/bots/b1/subscribers`, ({ request }) => {
        search = new URL(request.url).search;
        return apiOk({ items: [], page: 2, pageSize: 10, total: 0 });
      }),
    );
    const result = await getBotSubscribers('b1', { q: 'oli', page: 2, pageSize: 10 });
    expect(new URLSearchParams(search).get('q')).toBe('oli');
    expect(new URLSearchParams(search).get('page')).toBe('2');
    expect(new URLSearchParams(search).get('pageSize')).toBe('10');
    expect(result.items).toEqual([]);
  });

  it('exportBotSubscribers：带 Bearer，返回 CSV Blob', async () => {
    login();
    let authorization: string | null = null;
    server.use(
      http.get(`${API}/bots/b1/subscribers/export`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return new Response('a,b\n1,2', { headers: { 'Content-Type': 'text/csv' } });
      }),
    );
    const blob = await exportBotSubscribers('b1');
    expect(authorization).toBe('Bearer jwt-bot');
    expect(await blob.text()).toBe('a,b\n1,2');
  });

  it('getBotStats：bot 不存在（404）时 reject', async () => {
    login();
    server.use(http.get(`${API}/bots/x/stats`, () => apiFail('NOT_FOUND', 'Bot 不存在', 404)));
    await expect(getBotStats('x')).rejects.toThrow();
  });
});
