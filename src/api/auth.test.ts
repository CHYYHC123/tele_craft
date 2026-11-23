import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';
import {
  createLoginSession,
  exchangeLoginSession,
  getLoginSession,
  getSdkNonce,
  loginWithSdk,
} from '@/api/auth';
import { apiFail, apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useUserStore } from '@/store/user';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';

describe('api/auth 扫码登录', () => {
  it('创建会话：解包 model 并包含 clientSecret', async () => {
    const session = await createLoginSession();
    expect(session.token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(session.deepLink).toContain(session.token);
    expect(session.clientSecret).toEqual(expect.any(String));
  });

  it('查询会话：未知 token 返回 expired（HTTP 200）', async () => {
    const state = await getLoginSession('A'.repeat(22));
    expect(state).toEqual({ status: 'expired', scannedBy: null, user: null });
  });

  it('兑换：提交 clientSecret，拿到 accessToken', async () => {
    let body: unknown;
    server.use(
      http.post(`${API}/auth/telegram/sessions/:token/exchange`, async ({ request }) => {
        body = await request.json();
        return apiOk({
          accessToken: 'jwt',
          expiresIn: 60,
          user: { id: 'u1', telegramId: '9', firstName: '', lastName: '', username: '' },
        });
      }),
    );
    const result = await exchangeLoginSession('A'.repeat(22), 'secret');
    expect(body).toEqual({ clientSecret: 'secret' });
    expect(result.accessToken).toBe('jwt');
    expect(result.user.telegramId).toBe('9');
  });

  it('HTTP 200 但业务码非 "0" 时 reject', async () => {
    server.use(
      http.post(`${API}/auth/telegram/sessions`, () =>
        apiFail('LOGIN_TOKEN_EXHAUSTED', 'busy', 200),
      ),
    );
    await expect(createLoginSession()).rejects.toThrow('busy');
  });

  it('兑换失败（409）时 reject', async () => {
    server.use(
      http.post(`${API}/auth/telegram/sessions/:token/exchange`, () =>
        apiFail('1006', '会话不存在', 409),
      ),
    );
    await expect(exchangeLoginSession('A'.repeat(22), 's')).rejects.toThrow();
  });
});

describe('api/auth 弹窗登录', () => {
  it('领取 nonce 与 clientId', async () => {
    const result = await getSdkNonce();
    expect(result.nonce).toEqual(expect.any(String));
    expect(result.clientId).toBe('123456789');
  });

  it('用 idToken 换 accessToken，请求体是 { idToken }', async () => {
    let body: unknown;
    server.use(
      http.post(`${API}/auth/telegram/sdk/login`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          code: '0',
          msg: 'success',
          model: { accessToken: 'jwt', expiresIn: 60, user: { id: 'u1' } },
          traceId: 't',
          success: true,
          error: false,
        });
      }),
    );
    const result = await loginWithSdk('id-token');
    expect(body).toEqual({ idToken: 'id-token' });
    expect(result.accessToken).toBe('jwt');
  });

  it('id_token 无效（401）时 reject，且不会清掉登录态（未带 Bearer）', async () => {
    useUserStore.getState().setAuth({
      accessToken: 'old',
      expiresIn: 60,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    server.use(
      http.post(`${API}/auth/telegram/sdk/login`, () => apiFail('UNAUTHORIZED', 'bad token', 401)),
    );
    await expect(loginWithSdk('bad')).rejects.toThrow();
    expect(useUserStore.getState().token).toBe('old');
    useUserStore.getState().logout();
  });
});

describe('request 拦截器', () => {
  it('非登录接口带 Bearer accessToken，401 时清空登录态', async () => {
    const { default: request } = await import('@/api/request');
    useUserStore.getState().setAuth({
      accessToken: 'jwt-123',
      expiresIn: 60,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });

    let authorization: string | null = null;
    server.use(
      http.get(`${API}/me`, ({ request: req }) => {
        authorization = req.headers.get('authorization');
        return apiFail('UNAUTHORIZED', 'expired', 401);
      }),
    );

    await expect(request.get('/me')).rejects.toThrow();
    expect(authorization).toBe('Bearer jwt-123');
    expect(useUserStore.getState().token).toBeNull();
  });
});
