import { http } from 'msw';
import { apiFail, apiOk } from '@/mocks/response';
import type {
  AutoReply,
  Bot,
  BotMenu,
  BotMenuParams,
  BotStats,
  BotWelcome,
  KeyboardButton,
  KeyboardButtonParams,
  KeyboardImage,
  KeyboardLayout,
  KeywordReplyParams,
  KeywordReplyRule,
  StartMessage,
  StartMessageImage,
  Subscriber,
  SubscriberPage,
  UpdateAutoReplyParams,
  UpdateStartMessageParams,
} from '@/types/bot';
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

/** 欢迎语（内存态，按 bot id 存；没有记录表示未配置） */
const mockWelcomes = new Map<string, string>();

/** 测试用：重置/预置 mock 欢迎语 */
export function resetMockWelcomes(welcomes: Record<string, string> = {}) {
  mockWelcomes.clear();
  Object.entries(welcomes).forEach(([id, description]) => mockWelcomes.set(id, description));
}

/** 未配置过开场消息时服务端返回的空模板 */
const EMPTY_START_MESSAGE: StartMessage = {
  messageType: 'text',
  imageUrl: null,
  description: '',
  buttonsEnabled: false,
  buttons: [],
};

/** 开场消息（内存态，按 bot id 存；没有记录表示未配置） */
const mockStartMessages = new Map<string, StartMessage>();

/** 测试用：重置/预置 mock 开场消息 */
export function resetMockStartMessages(messages: Record<string, StartMessage> = {}) {
  mockStartMessages.clear();
  Object.entries(messages).forEach(([id, message]) => mockStartMessages.set(id, message));
}

/** 未配置过自动回复时服务端返回的空模板 */
const EMPTY_AUTO_REPLY: AutoReply = {
  keywordEnabled: false,
  receiveEnabled: false,
  receiveContent: '',
  keywordReplies: [],
};

/** 自动回复（内存态，按 bot id 存；没有记录表示未配置） */
const mockAutoReplies = new Map<string, AutoReply>();

/** 测试用：重置/预置 mock 自动回复 */
export function resetMockAutoReplies(autoReplies: Record<string, AutoReply> = {}) {
  mockAutoReplies.clear();
  Object.entries(autoReplies).forEach(([id, value]) => mockAutoReplies.set(id, value));
}

/** 命令菜单（内存态，按 bot id 存；没有记录表示未配置，读取时是空数组） */
const mockMenus = new Map<string, BotMenu[]>();
/** 这个 Bot 上传过、还没被保存进菜单的配图地址 */
const mockMenuImages = new Map<string, Set<string>>();

const MOCK_MENU_LIMIT = 99;
const MENU_COMMAND_PATTERN = /^[a-z0-9_]{1,32}$/;

/** 测试用：重置/预置 mock 命令菜单 */
export function resetMockMenus(menus: Record<string, BotMenu[]> = {}) {
  mockMenus.clear();
  mockMenuImages.clear();
  Object.entries(menus).forEach(([id, value]) => mockMenus.set(id, value));
}

/** 去掉开头的 / 并转成小写 */
const normalizeMenuCommand = (command: string) => command.trim().replace(/^\/+/, '').toLowerCase();

/**
 * 校验菜单请求体。格式不合法返回 400 VALIDATION_ERROR，
 * 命令重复或图片不属于这个 Bot 返回 400 BAD_REQUEST，通过则返回规整后的值。
 */
function checkMenuBody(
  body: Partial<BotMenuParams> | null,
  others: BotMenu[],
  botId: string,
  currentImageUrl: string | null,
): { value: BotMenuParams } | { error: Response } {
  const validationError = () => ({
    error: apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
      { path: ['menu'], message: 'Invalid' },
    ]),
  });
  if (!body) return validationError();

  const command = typeof body.command === 'string' ? normalizeMenuCommand(body.command) : '';
  if (!MENU_COMMAND_PATTERN.test(command) || command === 'start') return validationError();

  const commandDescription =
    typeof body.commandDescription === 'string' ? body.commandDescription.trim() : '';
  if (!commandDescription || commandDescription.length > 256) return validationError();
  if (others.some((item) => item.command === command)) {
    return { error: apiFail('BAD_REQUEST', '命令已存在', 400) };
  }

  const { messageType } = body;
  if (messageType !== 'graphic' && messageType !== 'text' && messageType !== 'link') {
    return validationError();
  }

  const description = typeof body.description === 'string' ? body.description : '';
  if (
    description.length > 1024 ||
    (description.match(HTML_TAG) ?? []).some((tag) => !ALLOWED_TAG.test(tag))
  ) {
    return validationError();
  }

  const buttons = Array.isArray(body.buttons) ? body.buttons : [];
  if (
    buttons.some(
      (button) => !button?.name || button.name.length > 64 || !/^https?:\/\//.test(button.url),
    )
  ) {
    return validationError();
  }

  const imageUrl = body.imageUrl ?? null;
  const uploaded = mockMenuImages.get(botId) ?? new Set<string>();
  const imageAllowed =
    imageUrl === null ||
    uploaded.has(imageUrl) ||
    (currentImageUrl !== null && imageUrl === currentImageUrl);
  if (messageType === 'graphic' && !imageUrl) return validationError();
  if (messageType === 'graphic' && !imageAllowed) {
    return { error: apiFail('BAD_REQUEST', 'imageUrl 不是这个 Bot 上传过的图片', 400) };
  }
  if (messageType === 'text' && description.trim() === '') return validationError();

  const linkUrl = typeof body.linkUrl === 'string' ? body.linkUrl.trim() : null;
  if (messageType === 'link' && (!linkUrl || !/^https?:\/\//.test(linkUrl))) {
    return validationError();
  }

  return {
    value: {
      command,
      commandDescription,
      messageType,
      imageUrl: messageType === 'graphic' ? imageUrl : null,
      description: messageType === 'link' ? '' : description,
      linkUrl: messageType === 'link' ? linkUrl : null,
      buttonsEnabled: messageType === 'link' ? false : Boolean(body.buttonsEnabled),
      buttons:
        messageType === 'link'
          ? []
          : buttons.map((button) => ({ name: button.name, url: button.url })),
    },
  };
}

/** 键盘按钮（内存态，按 bot id 存成按行分组的二维数组；没有记录表示未配置） */
const mockKeyboards = new Map<string, KeyboardButton[][]>();
/** 这个 Bot 上传过、还没被保存进按钮的键盘配图地址 */
const mockKeyboardImages = new Map<string, Set<string>>();

const MOCK_KEYBOARD_LIMIT = 30;
const MOCK_KEYBOARD_ROW_LIMIT = 3;

/** 测试用：重置/预置 mock 键盘按钮 */
export function resetMockKeyboards(keyboards: Record<string, KeyboardButton[][]> = {}) {
  mockKeyboards.clear();
  mockKeyboardImages.clear();
  Object.entries(keyboards).forEach(([id, rows]) => mockKeyboards.set(id, rows));
}

/**
 * 校验键盘按钮请求体。格式不合法返回 400 VALIDATION_ERROR，
 * 名称重复或图片不属于这个 Bot 返回 400 BAD_REQUEST，通过则返回规整后的值。
 */
function checkKeyboardBody(
  body: Partial<KeyboardButtonParams> | null,
  others: KeyboardButton[],
  botId: string,
  currentImageUrl: string | null,
): { value: KeyboardButtonParams } | { error: Response } {
  const validationError = () => ({
    error: apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
      { path: ['button'], message: 'Invalid' },
    ]),
  });
  if (!body) return validationError();

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 64 || text.startsWith('/')) return validationError();

  const remark = typeof body.remark === 'string' ? body.remark.trim() : '';
  if (remark.length > 256) return validationError();

  const { messageType } = body;
  if (messageType !== 'graphic' && messageType !== 'text' && messageType !== 'link') {
    return validationError();
  }

  const description = typeof body.description === 'string' ? body.description : '';
  if (
    description.length > 1024 ||
    (description.match(HTML_TAG) ?? []).some((tag) => !ALLOWED_TAG.test(tag))
  ) {
    return validationError();
  }

  const buttons = Array.isArray(body.buttons) ? body.buttons : [];
  if (
    buttons.length > 10 ||
    buttons.some(
      (button) => !button?.name || button.name.length > 64 || !/^https?:\/\//.test(button.url),
    )
  ) {
    return validationError();
  }

  const imageUrl = body.imageUrl ?? null;
  if (messageType === 'graphic' && !imageUrl) return validationError();
  if (messageType === 'text' && description.trim() === '') return validationError();

  const linkUrl = typeof body.linkUrl === 'string' ? body.linkUrl.trim() : null;
  if (messageType === 'link' && (!linkUrl || !/^https?:\/\//.test(linkUrl))) {
    return validationError();
  }

  if (others.some((item) => item.text === text)) {
    return { error: apiFail('BAD_REQUEST', '按钮名称已存在', 400) };
  }

  const uploaded = mockKeyboardImages.get(botId) ?? new Set<string>();
  const imageAllowed =
    imageUrl === null ||
    uploaded.has(imageUrl) ||
    (currentImageUrl !== null && imageUrl === currentImageUrl);
  if (messageType === 'graphic' && !imageAllowed) {
    return { error: apiFail('BAD_REQUEST', 'imageUrl 不是这个 Bot 上传过的图片', 400) };
  }

  return {
    value: {
      text,
      remark,
      messageType,
      imageUrl: messageType === 'graphic' ? imageUrl : null,
      description: messageType === 'link' ? '' : description,
      linkUrl: messageType === 'link' ? linkUrl : null,
      buttonsEnabled: messageType === 'link' ? false : Boolean(body.buttonsEnabled),
      buttons:
        messageType === 'link'
          ? []
          : buttons.map((button) => ({ name: button.name, url: button.url })),
    },
  };
}

/** 开场消息配图的公网地址前缀（真实地址由 Upstash Blob 返回，这里模拟同一格式） */
const MOCK_BLOB_PREFIX = 'https://example.blob.upstash.io/bots/';
const MOCK_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const MOCK_IMAGE_TYPES = ['image/png', 'image/jpeg'];
/** 开场消息文案允许的 HTML 标签 */
const ALLOWED_TAG = /^<\/?(b|i|a|br)(\s[^>]*)?>$/i;
const HTML_TAG = /<\/?[a-z][^>]*>/gi;

const MOCK_KEYWORD_REPLY_LIMIT = 100;
const MOCK_KEYWORD_MAX_COUNT = 10;
const MOCK_KEYWORD_CONTENT_MAX = 370;

/**
 * 校验关键词回复请求体：格式不合法返回 400 VALIDATION_ERROR，
 * 和 others（同一 Bot 的其它规则）重复返回 400 BAD_REQUEST，通过则返回规整后的值。
 */
function checkKeywordReply(
  body: Partial<KeywordReplyParams> | null,
  others: KeywordReplyRule[],
): { value: KeywordReplyParams } | { error: Response } {
  const validationError = (path: string) => ({
    error: apiFail('VALIDATION_ERROR', '参数校验失败', 400, [{ path: [path], message: 'Invalid' }]),
  });
  const keywords = Array.isArray(body?.keywords)
    ? body.keywords.map((word) => (typeof word === 'string' ? word.trim() : ''))
    : [];
  const lowered = keywords.map((word) => word.toLowerCase());
  if (
    keywords.length === 0 ||
    keywords.length > MOCK_KEYWORD_MAX_COUNT ||
    keywords.some((word) => !word || word.startsWith('/')) ||
    new Set(lowered).size !== lowered.length
  ) {
    return validationError('keywords');
  }
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  if (
    !content ||
    content.length > MOCK_KEYWORD_CONTENT_MAX ||
    (content.match(HTML_TAG) ?? []).some((tag) => !ALLOWED_TAG.test(tag))
  ) {
    return validationError('content');
  }
  const taken = new Set(others.flatMap((item) => item.keywords.map((word) => word.toLowerCase())));
  if (lowered.some((word) => taken.has(word))) {
    return { error: apiFail('BAD_REQUEST', '关键词和已有规则重复', 400) };
  }
  return { value: { keywords, content } };
}

/** 订阅者（内存态，默认空） */
let mockSubscribers: Subscriber[] = [];

/** 测试用：重置/预置 mock 订阅者 */
export function resetMockSubscribers(subscribers: Subscriber[] = []) {
  mockSubscribers = subscribers;
}

const MOCK_STATS: BotStats = {
  followersAll: 2420,
  followersAllChange: 20,
  addedToday: 125,
  addedTodayChange: 32,
  activeToday: 316,
  unsubscribedToday: 12,
  unsubscribedTodayChange: -8,
};

const CSV_BOM = '\uFEFF';

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

  // 退出登录：需要 Bearer 凭证，没带则 401
  http.post(`${API_BASE}/auth/logout`, ({ request }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    return apiOk(null);
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

  // 修改 Bot 显示名
  http.patch(`${API_BASE}/bots/:id`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const bot = mockBots.find((item) => item.id === params.id);
    if (!bot) return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    const body = (await request.json().catch(() => null)) as {
      displayName?: string;
      shortDescription?: string;
    } | null;
    const displayName = body?.displayName?.trim();
    const shortDescription = body?.shortDescription;
    const invalidName =
      displayName !== undefined && (displayName.length === 0 || displayName.length > 64);
    const invalidDescription = shortDescription !== undefined && shortDescription.length > 120;
    const nothingToUpdate = displayName === undefined && shortDescription === undefined;
    if (invalidName || invalidDescription || nothingToUpdate) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: [invalidDescription ? 'shortDescription' : 'displayName'], message: 'Invalid' },
      ]);
    }
    const updated: Bot = {
      ...bot,
      displayName: displayName ?? bot.displayName,
      shortDescription: shortDescription ?? bot.shortDescription,
    };
    mockBots = mockBots.map((item) => (item.id === bot.id ? updated : item));
    return apiOk(updated);
  }),

  // 读取欢迎语（未配置时 description 为 null）
  http.get(`${API_BASE}/bots/:id/welcome`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const model: BotWelcome = { description: mockWelcomes.get(String(params.id)) ?? null };
    return apiOk(model);
  }),

  // 保存并发布欢迎语
  http.put(`${API_BASE}/bots/:id/welcome`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const body = (await request.json().catch(() => null)) as { description?: string } | null;
    const description = body?.description;
    if (typeof description !== 'string' || description.length > 512) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['description'], message: 'Invalid' },
      ]);
    }
    mockWelcomes.set(String(params.id), description);
    const model: BotWelcome = { description };
    return apiOk(model);
  }),

  // 读取开场消息（未配置时返回空模板）
  http.get(`${API_BASE}/bots/:id/start-message`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    return apiOk(mockStartMessages.get(String(params.id)) ?? EMPTY_START_MESSAGE);
  }),

  // 上传开场消息配图（multipart，文件字段名 file）：只返回公网地址，不改已发布的消息
  http.post(`${API_BASE}/bots/:id/start-message/image`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    // 这里只校验类型和大小；640×360 的尺寸校验留给真实后端
    if (
      !file ||
      typeof file === 'string' ||
      !MOCK_IMAGE_TYPES.includes(file.type) ||
      file.size > MOCK_IMAGE_MAX_BYTES
    ) {
      return apiFail('BAD_REQUEST', '只支持 PNG/JPG，且不超过 2MB', 400);
    }
    const model: StartMessageImage = {
      imageUrl: `${MOCK_BLOB_PREFIX}${String(params.id)}/${file.name}`,
    };
    return apiOk(model);
  }),

  // 保存并发布开场消息（不调 Telegram 资料接口）
  http.put(`${API_BASE}/bots/:id/start-message`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const body = (await request.json().catch(() => null)) as UpdateStartMessageParams | null;
    const isGraphic = body?.messageType === 'graphic';
    const buttons = body?.buttons ?? [];
    const description = body?.description;
    const invalidDescription =
      typeof description !== 'string' ||
      description.length > 1024 ||
      (description.match(HTML_TAG) ?? []).some((tag) => !ALLOWED_TAG.test(tag));
    const invalidButtons =
      !Array.isArray(buttons) ||
      buttons.length > 10 ||
      buttons.some(
        (button) => !button.name || button.name.length > 64 || !/^https?:\/\//.test(button.url),
      );

    if (
      !body ||
      (body.messageType !== 'text' && body.messageType !== 'graphic') ||
      invalidDescription ||
      invalidButtons ||
      (isGraphic && !body.imageUrl)
    ) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['start-message'], message: 'Invalid' },
      ]);
    }
    if (body?.imageUrl && !body.imageUrl.startsWith(`${MOCK_BLOB_PREFIX}${id}/`)) {
      return apiFail('BAD_REQUEST', 'imageUrl 不是这个 Bot 上传过的图片', 400);
    }
    const saved: StartMessage = {
      messageType: body.messageType,
      imageUrl: isGraphic ? (body.imageUrl ?? null) : null,
      description: description as string,
      buttonsEnabled: Boolean(body.buttonsEnabled),
      buttons,
    };
    mockStartMessages.set(id, saved);
    return apiOk(saved);
  }),

  // 读取自动回复（未配置时返回空模板）
  http.get(`${API_BASE}/bots/:id/auto-reply`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    return apiOk(mockAutoReplies.get(String(params.id)) ?? EMPTY_AUTO_REPLY);
  }),

  // 更新自动回复开关/兜底正文：只合并提交的字段，返回完整对象
  http.put(`${API_BASE}/bots/:id/auto-reply`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const body = (await request.json().catch(() => null)) as UpdateAutoReplyParams | null;
    const patch: UpdateAutoReplyParams = {};
    if (typeof body?.keywordEnabled === 'boolean') patch.keywordEnabled = body.keywordEnabled;
    if (typeof body?.receiveEnabled === 'boolean') patch.receiveEnabled = body.receiveEnabled;
    if (typeof body?.receiveContent === 'string') patch.receiveContent = body.receiveContent;
    const invalidContent =
      patch.receiveContent !== undefined &&
      (patch.receiveContent.match(HTML_TAG) ?? []).some((tag) => !ALLOWED_TAG.test(tag));
    if (Object.keys(patch).length === 0 || invalidContent) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['auto-reply'], message: 'Invalid' },
      ]);
    }
    const saved: AutoReply = { ...(mockAutoReplies.get(id) ?? EMPTY_AUTO_REPLY), ...patch };
    if (saved.receiveEnabled && saved.receiveContent.trim() === '') {
      return apiFail('BAD_REQUEST', '兜底回复开启时正文不能为空', 400);
    }
    mockAutoReplies.set(id, saved);
    return apiOk(saved);
  }),

  // 新增关键词回复
  http.post(`${API_BASE}/bots/:id/keyword-replies`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const body = (await request.json().catch(() => null)) as Partial<KeywordReplyParams> | null;
    const autoReply = mockAutoReplies.get(id) ?? EMPTY_AUTO_REPLY;
    const checked = checkKeywordReply(body, autoReply.keywordReplies);
    if ('error' in checked) return checked.error;
    if (autoReply.keywordReplies.length >= MOCK_KEYWORD_REPLY_LIMIT) {
      return apiFail('BAD_REQUEST', '这个 Bot 的关键词回复已达上限', 400);
    }
    const rule: KeywordReplyRule = { id: crypto.randomUUID(), ...checked.value };
    mockAutoReplies.set(id, {
      ...autoReply,
      keywordReplies: [...autoReply.keywordReplies, rule],
    });
    return apiOk(rule);
  }),

  // 修改关键词回复：关键词整批替换，和自己原来的关键词不算重复
  http.put(`${API_BASE}/bots/:id/keyword-replies/:replyId`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    const replyId = String(params.replyId);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const autoReply = mockAutoReplies.get(id) ?? EMPTY_AUTO_REPLY;
    if (!autoReply.keywordReplies.some((item) => item.id === replyId)) {
      return apiFail('NOT_FOUND', '关键词回复不存在', 404);
    }
    const body = (await request.json().catch(() => null)) as Partial<KeywordReplyParams> | null;
    const others = autoReply.keywordReplies.filter((item) => item.id !== replyId);
    const checked = checkKeywordReply(body, others);
    if ('error' in checked) return checked.error;
    const rule: KeywordReplyRule = { id: replyId, ...checked.value };
    mockAutoReplies.set(id, {
      ...autoReply,
      keywordReplies: autoReply.keywordReplies.map((item) => (item.id === replyId ? rule : item)),
    });
    return apiOk(rule);
  }),

  // 删除关键词回复：成功 model 为 null，开关状态不变
  http.delete(`${API_BASE}/bots/:id/keyword-replies/:replyId`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    const replyId = String(params.replyId);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const autoReply = mockAutoReplies.get(id) ?? EMPTY_AUTO_REPLY;
    if (!autoReply.keywordReplies.some((item) => item.id === replyId)) {
      return apiFail('NOT_FOUND', '关键词回复不存在', 404);
    }
    mockAutoReplies.set(id, {
      ...autoReply,
      keywordReplies: autoReply.keywordReplies.filter((item) => item.id !== replyId),
    });
    return apiOk(null);
  }),

  // 读取命令菜单（未配置时是空数组，不含 /start）
  http.get(`${API_BASE}/bots/:id/menus`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    return apiOk(mockMenus.get(String(params.id)) ?? []);
  }),

  // 上传菜单配图：只返回公网地址，不改已发布的菜单
  http.post(`${API_BASE}/bots/:id/menus/image`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    if (
      !file ||
      typeof file === 'string' ||
      !MOCK_IMAGE_TYPES.includes(file.type) ||
      file.size > MOCK_IMAGE_MAX_BYTES
    ) {
      return apiFail('BAD_REQUEST', '只支持 PNG/JPG，且不超过 2MB', 400);
    }
    const model: StartMessageImage = {
      imageUrl: `${MOCK_BLOB_PREFIX}${id}/menus/${file.name}`,
    };
    const uploaded = mockMenuImages.get(id) ?? new Set<string>();
    uploaded.add(model.imageUrl);
    mockMenuImages.set(id, uploaded);
    return apiOk(model);
  }),

  // 新建并发布菜单项，排在末尾
  http.post(`${API_BASE}/bots/:id/menus`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const menus = mockMenus.get(id) ?? [];
    const body = (await request.json().catch(() => null)) as Partial<BotMenuParams> | null;
    const checked = checkMenuBody(body, menus, id, null);
    if ('error' in checked) return checked.error;
    if (menus.length >= MOCK_MENU_LIMIT) {
      return apiFail('BAD_REQUEST', '菜单已有 99 条', 400);
    }
    const menu: BotMenu = { id: crypto.randomUUID(), ...checked.value };
    mockMenus.set(id, [...menus, menu]);
    return apiOk(menu);
  }),

  // 修改并发布菜单项
  http.put(`${API_BASE}/bots/:id/menus/:menuId`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    const menuId = String(params.menuId);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const menus = mockMenus.get(id) ?? [];
    const current = menus.find((item) => item.id === menuId);
    if (!current) return apiFail('NOT_FOUND', '菜单项不存在', 404);
    const body = (await request.json().catch(() => null)) as Partial<BotMenuParams> | null;
    const checked = checkMenuBody(
      body,
      menus.filter((item) => item.id !== menuId),
      id,
      current.imageUrl,
    );
    if ('error' in checked) return checked.error;
    const menu: BotMenu = { id: menuId, ...checked.value };
    mockMenus.set(
      id,
      menus.map((item) => (item.id === menuId ? menu : item)),
    );
    return apiOk(menu);
  }),

  // 删除菜单项：成功 model 为 null
  http.delete(`${API_BASE}/bots/:id/menus/:menuId`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    const menuId = String(params.menuId);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const menus = mockMenus.get(id) ?? [];
    if (!menus.some((item) => item.id === menuId)) {
      return apiFail('NOT_FOUND', '菜单项不存在', 404);
    }
    mockMenus.set(
      id,
      menus.filter((item) => item.id !== menuId),
    );
    return apiOk(null);
  }),

  // 读取键盘按钮布局（未配置时 rows 是空数组）
  http.get(`${API_BASE}/bots/:id/keyboard`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const model: KeyboardLayout = { rows: mockKeyboards.get(String(params.id)) ?? [] };
    return apiOk(model);
  }),

  // 上传键盘按钮配图：只返回公网地址，不改已保存的按钮
  http.post(`${API_BASE}/bots/:id/keyboard/image`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    if (
      !file ||
      typeof file === 'string' ||
      !MOCK_IMAGE_TYPES.includes(file.type) ||
      file.size > MOCK_IMAGE_MAX_BYTES
    ) {
      return apiFail('BAD_REQUEST', '只支持 PNG/JPG，且不超过 2MB', 400);
    }
    const model: KeyboardImage = {
      imageUrl: `${MOCK_BLOB_PREFIX}${id}/keyboard/${file.name}`,
    };
    const uploaded = mockKeyboardImages.get(id) ?? new Set<string>();
    uploaded.add(model.imageUrl);
    mockKeyboardImages.set(id, uploaded);
    return apiOk(model);
  }),

  // 调整键盘布局：必须带全部按钮，每个只出现一次，每行 1-3 个
  http.put(`${API_BASE}/bots/:id/keyboard/layout`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const body = (await request.json().catch(() => null)) as { rows?: unknown } | null;
    const rows = body?.rows;
    if (
      !Array.isArray(rows) ||
      rows.some(
        (row) =>
          !Array.isArray(row) ||
          row.length === 0 ||
          row.length > MOCK_KEYBOARD_ROW_LIMIT ||
          row.some((item) => typeof item !== 'string'),
      )
    ) {
      return apiFail('VALIDATION_ERROR', '参数校验失败', 400, [
        { path: ['rows'], message: 'Invalid' },
      ]);
    }
    const current = (mockKeyboards.get(id) ?? []).flat();
    const submitted = (rows as string[][]).flat();
    if (
      submitted.length !== current.length ||
      new Set(submitted).size !== submitted.length ||
      submitted.some((buttonId) => !current.some((item) => item.id === buttonId))
    ) {
      return apiFail('BAD_REQUEST', '提交的按钮与现有按钮不一致，请刷新后重试', 400);
    }
    const layout = (rows as string[][]).map((row) =>
      row.map((buttonId) => current.find((item) => item.id === buttonId) as KeyboardButton),
    );
    mockKeyboards.set(id, layout);
    return apiOk<KeyboardLayout>({ rows: layout });
  }),

  // 新增键盘按钮，自成一行放在最后
  http.post(`${API_BASE}/bots/:id/keyboard/buttons`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const rows = mockKeyboards.get(id) ?? [];
    const body = (await request.json().catch(() => null)) as Partial<KeyboardButtonParams> | null;
    const checked = checkKeyboardBody(body, rows.flat(), id, null);
    if ('error' in checked) return checked.error;
    if (rows.flat().length >= MOCK_KEYBOARD_LIMIT) {
      return apiFail('BAD_REQUEST', '按钮已有 30 个', 400);
    }
    const button: KeyboardButton = { id: crypto.randomUUID(), ...checked.value };
    mockKeyboards.set(id, [...rows, [button]]);
    return apiOk(button);
  }),

  // 修改键盘按钮内容，位置不变
  http.put(`${API_BASE}/bots/:id/keyboard/buttons/:buttonId`, async ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    const buttonId = String(params.buttonId);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const rows = mockKeyboards.get(id) ?? [];
    const current = rows.flat().find((item) => item.id === buttonId);
    if (!current) return apiFail('NOT_FOUND', '按钮不存在', 404);
    const body = (await request.json().catch(() => null)) as Partial<KeyboardButtonParams> | null;
    const checked = checkKeyboardBody(
      body,
      rows.flat().filter((item) => item.id !== buttonId),
      id,
      current.imageUrl,
    );
    if ('error' in checked) return checked.error;
    const button: KeyboardButton = { id: buttonId, ...checked.value };
    mockKeyboards.set(
      id,
      rows.map((row) => row.map((item) => (item.id === buttonId ? button : item))),
    );
    return apiOk(button);
  }),

  // 删除键盘按钮：右边的按钮左移，空行消失；成功 model 为 null
  http.delete(`${API_BASE}/bots/:id/keyboard/buttons/:buttonId`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    const id = String(params.id);
    const buttonId = String(params.buttonId);
    if (!mockBots.some((item) => item.id === id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const rows = mockKeyboards.get(id) ?? [];
    if (!rows.flat().some((item) => item.id === buttonId)) {
      return apiFail('NOT_FOUND', '按钮不存在', 404);
    }
    mockKeyboards.set(
      id,
      rows.map((row) => row.filter((item) => item.id !== buttonId)).filter((row) => row.length > 0),
    );
    return apiOk(null);
  }),

  // 首页统计
  http.get(`${API_BASE}/bots/:id/stats`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    return apiOk(MOCK_STATS);
  }),

  // 订阅者导出（CSV，不是 JSON 外壳）
  http.get(`${API_BASE}/bots/:id/subscribers/export`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const rows = mockSubscribers.map((item) =>
      [
        [item.firstName, item.lastName].filter(Boolean).join(' '),
        item.username ?? '',
        item.firstSeenAt,
        item.lastActiveAt,
        item.phone ?? '',
      ].join(','),
    );
    const csv = `${CSV_BOM}姓名,用户名,首次进入,最近活跃,手机号\n${rows.join('\n')}`;
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
      },
    });
  }),

  // 订阅者列表：按最近活跃倒序，支持搜索与分页
  http.get(`${API_BASE}/bots/:id/subscribers`, ({ request, params }) => {
    if (!request.headers.get('authorization')) {
      return apiFail('UNAUTHORIZED', '未登录或登录已失效', 401);
    }
    if (!mockBots.some((item) => item.id === params.id)) {
      return apiFail('NOT_FOUND', 'Bot 不存在', 404);
    }
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || 20));
    const matched = mockSubscribers
      .filter(
        (item) =>
          !q ||
          item.firstName.toLowerCase().includes(q) ||
          (item.username ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
    const model: SubscriberPage = {
      items: matched.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: matched.length,
    };
    return apiOk(model);
  }),
];
