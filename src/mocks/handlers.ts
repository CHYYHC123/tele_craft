import { http, HttpResponse } from 'msw';
import type { LoginParams, LoginResult } from '@/types/auth';

/** mock 的 baseURL 需与 axios 实例保持一致 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * 所有接口 mock 都登记在这里。
 * 一个接口一个 handler，按业务可拆成多个文件再在此汇总。
 */
export const handlers = [
  // 登录
  http.post<never, LoginParams>(`${API_BASE}/login`, async ({ request }) => {
    const { username, password } = (await request.json()) as LoginParams;

    // 简单校验：演示失败分支
    if (!username || !password) {
      return HttpResponse.json({ message: '用户名或密码不能为空' }, { status: 400 });
    }

    const result: LoginResult = {
      token: 'mock-token-123456',
      user: { id: '1', name: username, avatar: undefined },
    };
    return HttpResponse.json(result);
  }),
];
