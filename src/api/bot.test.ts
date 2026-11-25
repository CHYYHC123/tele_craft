import { http } from 'msw';
import { describe, it, expect } from 'vitest';
import {
  addBot,
  exportBotSubscribers,
  getBotAutoReply,
  getBotStats,
  getBotSubscribers,
  getBotStartMessage,
  getBotWelcome,
  getBots,
  updateBot,
  updateBotAutoReply,
  updateBotStartMessage,
  updateBotWelcome,
  uploadBotStartMessageImage,
} from '@/api/bot';
import { apiFail, apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useUserStore } from '@/store/user';
import type { UpdateStartMessageParams } from '@/types/bot';

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

  it('getBotWelcome：解包欢迎语，未配置时为 null', async () => {
    login();
    server.use(http.get(`${API}/bots/b1/welcome`, () => apiOk({ description: null })));
    await expect(getBotWelcome('b1')).resolves.toEqual({ description: null });
  });

  it('updateBotWelcome：PUT 请求体是 { description }', async () => {
    login();
    let body: unknown;
    server.use(
      http.put(`${API}/bots/b1/welcome`, async ({ request }) => {
        body = await request.json();
        return apiOk({ description: 'Hi' });
      }),
    );
    await expect(updateBotWelcome('b1', 'Hi')).resolves.toEqual({ description: 'Hi' });
    expect(body).toEqual({ description: 'Hi' });
  });

  it('updateBotWelcome：Telegram 拒绝（1013）时 reject', async () => {
    login();
    server.use(http.put(`${API}/bots/b1/welcome`, () => apiFail('1013', 'Telegram 拒绝', 400)));
    await expect(updateBotWelcome('b1', 'Hi')).rejects.toThrow();
  });

  it('getBotStartMessage：带 Bearer，解包未配置时的空模板', async () => {
    login();
    let authorization: string | null = null;
    const empty = {
      messageType: 'text',
      imageUrl: null,
      description: '',
      buttonsEnabled: false,
      buttons: [],
    };
    server.use(
      http.get(`${API}/bots/b1/start-message`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return apiOk(empty);
      }),
    );
    await expect(getBotStartMessage('b1')).resolves.toEqual(empty);
    expect(authorization).toBe('Bearer jwt-bot');
  });

  it('getBotStartMessage：bot 不存在（404）时 reject', async () => {
    login();
    server.use(
      http.get(`${API}/bots/x/start-message`, () => apiFail('NOT_FOUND', 'Bot 不存在', 404)),
    );
    await expect(getBotStartMessage('x')).rejects.toThrow();
  });

  it('updateBotStartMessage：PUT 请求体是开场消息，返回保存后的内容', async () => {
    login();
    let body: unknown;
    const saved = {
      messageType: 'graphic',
      imageUrl: 'https://example.blob.upstash.io/bots/b1/banner.jpg',
      description: 'Hi, <b>welcome</b>',
      buttonsEnabled: true,
      buttons: [{ name: 'Crypto Pay', url: 'https://example.com/pay' }],
    } satisfies UpdateStartMessageParams;
    server.use(
      http.put(`${API}/bots/b1/start-message`, async ({ request }) => {
        body = await request.json();
        return apiOk(saved);
      }),
    );
    await expect(updateBotStartMessage('b1', saved)).resolves.toEqual(saved);
    expect(body).toEqual(saved);
  });

  it('updateBotStartMessage：图片地址不属于这个 Bot（400）时 reject', async () => {
    login();
    server.use(
      http.put(`${API}/bots/b1/start-message`, () =>
        apiFail('BAD_REQUEST', 'imageUrl 不是这个 Bot 上传过的图片', 400),
      ),
    );
    await expect(
      updateBotStartMessage('b1', {
        messageType: 'graphic',
        imageUrl: 'https://other.example.com/a.jpg',
        description: '',
        buttonsEnabled: false,
        buttons: [],
      }),
    ).rejects.toThrow();
  });

  it('uploadBotStartMessageImage：multipart 文件字段名是 file，返回公网地址', async () => {
    login();
    let uploadedName: string | undefined;
    server.use(
      http.post(`${API}/bots/b1/start-message/image`, async ({ request }) => {
        const form = await request.formData();
        uploadedName = (form.get('file') as File | null)?.name;
        return apiOk({ imageUrl: 'https://example.blob.upstash.io/bots/b1/banner.jpg' });
      }),
    );
    const file = new File(['png'], 'banner.png', { type: 'image/png' });
    await expect(uploadBotStartMessageImage('b1', file)).resolves.toEqual({
      imageUrl: 'https://example.blob.upstash.io/bots/b1/banner.jpg',
    });
    expect(uploadedName).toBe('banner.png');
  });

  it('getBotAutoReply：带 Bearer，解包自动回复（含规则）', async () => {
    login();
    let authorization: string | null = null;
    const autoReply = {
      keywordEnabled: true,
      receiveEnabled: false,
      receiveContent: '',
      keywordReplies: [{ id: 'r1', keywords: ['Hello'], content: 'Hi' }],
    };
    server.use(
      http.get(`${API}/bots/b1/auto-reply`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return apiOk(autoReply);
      }),
    );
    await expect(getBotAutoReply('b1')).resolves.toEqual(autoReply);
    expect(authorization).toBe('Bearer jwt-bot');
  });

  it('updateBotAutoReply：PUT 请求体只含提交的字段，返回完整自动回复', async () => {
    login();
    let body: unknown;
    const saved = {
      keywordEnabled: false,
      receiveEnabled: true,
      receiveContent: 'We will reply soon.',
      keywordReplies: [],
    };
    server.use(
      http.put(`${API}/bots/b1/auto-reply`, async ({ request }) => {
        body = await request.json();
        return apiOk(saved);
      }),
    );
    await expect(
      updateBotAutoReply('b1', { receiveEnabled: true, receiveContent: 'We will reply soon.' }),
    ).resolves.toEqual(saved);
    expect(body).toEqual({ receiveEnabled: true, receiveContent: 'We will reply soon.' });
  });

  it('updateBotAutoReply：兜底开关打开但正文为空（400）时 reject', async () => {
    login();
    server.use(
      http.put(`${API}/bots/b1/auto-reply`, () => apiFail('BAD_REQUEST', '正文不能为空', 400)),
    );
    await expect(updateBotAutoReply('b1', { receiveEnabled: true })).rejects.toThrow();
  });

  it('getBotStats：bot 不存在（404）时 reject', async () => {
    login();
    server.use(http.get(`${API}/bots/x/stats`, () => apiFail('NOT_FOUND', 'Bot 不存在', 404)));
    await expect(getBotStats('x')).rejects.toThrow();
  });
});
