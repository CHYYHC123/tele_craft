import { http } from 'msw';
import { apiFail, apiOk } from '@/mocks/response';
import type { Bot } from '@/types/bot';
import type {
  AuthResult,
  LoginSession,
  LoginSessionState,
  SdkNonce,
  TelegramProfile,
} from '@/types/auth';

/** mock 的 baseURL 需与 axios 实例保持一致 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

const MOCK_PROFILE: TelegramProfile = {
  id: '123456789',
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: 'ada',
};

const MOCK_AUTH: AuthResult = {
  accessToken: 'mock-access-token',
  expiresIn: 86_400,
  user: {
    id: '4f6b0b3e-1c2a-4d5e-9f70-123456789abc',
    telegramId: MOCK_PROFILE.id,
    firstName: MOCK_PROFILE.firstName,
    lastName: MOCK_PROFILE.lastName,
    username: MOCK_PROFILE.username,
  },
};

function randomToken(length = 22): string {
  return Array.from({ length }, () => TOKEN_CHARS[Math.floor(Math.random() * 64)]).join('');
}

/** 已绑定的 Bot（内存态，默认空，模拟新用户） */
let mockBots: Bot[] = [];

/** 测试用：重置/预置 mock Bot 列表 */
export function resetMockBots(bots: Bot[] = []) {
  mockBots = bots;
}

/** 约定：这两个 token 分别触发「token 无效」「已被其他账号绑定」 */
export const MOCK_INVALID_BOT_TOKEN = '1:invalid';
export const MOCK_TAKEN_BOT_TOKEN = '2:taken';

const BOT_TOKEN_FORMAT = /^\d+:[A-Za-z0-9_-]+$/;

/** 扫码会话：记录 clientSecret 与被轮询次数，用来模拟 pending → scanned → confirmed */
const sessions = new Map<string, { clientSecret: string; polls: number; exchanged: boolean }>();

/**
 * 所有接口 mock 都登记在这里。
 * 一个接口一个 handler，按业务可拆成多个文件再在此汇总。
 */
export const handlers = [
  // 扫码登录：创建会话
  http.post(`${API_BASE}/auth/telegram/sessions`, () => {
    const token = randomToken();
    const clientSecret = randomToken(32);
    sessions.set(token, { clientSecret, polls: 0, exchanged: false });
    const model: LoginSession = {
      token,
      deepLink: `https://t.me/deep_cat_bot?start=login_${token}`,
      expiresAt: new Date(Date.now() + 180_000).toISOString(),
      clientSecret,
    };
    return apiOk(model);
  }),

  // 扫码登录：查询会话（第 1 次 pending，第 2 次 scanned，之后 confirmed）
  http.get(`${API_BASE}/auth/telegram/sessions/:token`, ({ params }) => {
    const token = String(params.token);
    if (!TOKEN_PATTERN.test(token)) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['token'], message: 'Invalid string' },
      ]);
    }
    const session = sessions.get(token);
    if (!session) {
      const expired: LoginSessionState = { status: 'expired', scannedBy: null, user: null };
      return apiOk(expired);
    }
    session.polls += 1;
    const model: LoginSessionState =
      session.polls <= 1
        ? { status: 'pending', scannedBy: null, user: null }
        : session.polls === 2
          ? { status: 'scanned', scannedBy: MOCK_PROFILE, user: null }
          : { status: 'confirmed', scannedBy: null, user: MOCK_PROFILE };
    return apiOk(model);
  }),

  // 扫码登录：兑换登录凭证
  http.post(`${API_BASE}/auth/telegram/sessions/:token/exchange`, async ({ params, request }) => {
    const token = String(params.token);
    const body = (await request.json().catch(() => null)) as { clientSecret?: string } | null;
    if (!TOKEN_PATTERN.test(token) || !body?.clientSecret) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['clientSecret'], message: 'Required' },
      ]);
    }
    const session = sessions.get(token);
    if (!session || session.exchanged || session.polls < 3) {
      return apiFail('1006', '会话不存在、已过期，或还没有确认', 409);
    }
    if (session.clientSecret !== body.clientSecret) {
      return apiFail('UNAUTHORIZED', 'clientSecret 不正确', 401);
    }
    session.exchanged = true;
    return apiOk(MOCK_AUTH);
  }),

  // 弹窗登录：领取 nonce
  http.post(`${API_BASE}/auth/telegram/sdk/nonce`, () => {
    const model: SdkNonce = {
      nonce: randomToken(),
      clientId: '123456789',
      expiresAt: new Date(Date.now() + 180_000).toISOString(),
    };
    return apiOk(model);
  }),

  // 弹窗登录：用 id_token 换登录凭证
  http.post(`${API_BASE}/auth/telegram/sdk/login`, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { idToken?: string } | null;
    if (!body?.idToken) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['idToken'], message: 'Required' },
      ]);
    }
    return apiOk(MOCK_AUTH);
  }),

  // 查询用户 Bot 列表
  http.get(`${API_BASE}/bots`, ({ request }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    return apiOk(mockBots);
  }),

  // 添加用户 Bot
  http.post(`${API_BASE}/bots`, async ({ request }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const body = (await request.json().catch(() => null)) as { token?: string } | null;
    const token = body?.token ?? '';
    if (!BOT_TOKEN_FORMAT.test(token)) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['token'], message: 'Invalid token format' },
      ]);
    }
    if (token === MOCK_INVALID_BOT_TOKEN) {
      return apiFail('1009', 'Bot token 无效', 400);
    }
    if (token === MOCK_TAKEN_BOT_TOKEN) {
      return apiFail('1010', '这个 Bot 已被其他账号绑定', 409);
    }
    const telegramBotId = token.split(':')[0];
    const existing = mockBots.find((bot) => bot.telegramBotId === telegramBotId);
    const bot: Bot = existing ?? {
      id: crypto.randomUUID(),
      telegramBotId,
      username: `bot_${telegramBotId}`,
      displayName: `Bit Store Card ${telegramBotId}`,
    };
    if (!existing) mockBots = [...mockBots, bot];
    return apiOk(bot);
  }),
];
