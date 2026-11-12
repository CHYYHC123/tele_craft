import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

/** Node 端（Vitest 测试）的 MSW server */
export const server = setupServer(...handlers);
