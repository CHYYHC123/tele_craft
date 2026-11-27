import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import {
  resetMockAutoReplies,
  resetMockBots,
  resetMockChats,
  resetMockMenus,
  resetMockMenuStrategies,
  resetMockSubscribers,
  resetMockWelcomes,
} from '@/mocks/handlers';
import { server } from '@/mocks/server';

// 测试全程启用 MSW：用例里可用 server.use(...) 覆盖单条 mock
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

// 每个用例后清理 DOM + 重置被覆盖的 mock handler，避免相互污染
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockBots();
  resetMockChats();
  resetMockMenus();
  resetMockMenuStrategies();
  resetMockSubscribers();
  resetMockWelcomes();
  resetMockAutoReplies();
});

afterAll(() => server.close());
