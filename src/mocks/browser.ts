import { setupWorker } from 'msw/browser';
import { handlers } from '@/mocks/handlers';

/** 浏览器端（开发环境）的 MSW worker */
export const worker = setupWorker(...handlers);
