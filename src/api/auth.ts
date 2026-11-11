import { http } from '@/api/request';
import type { LoginParams, LoginResult } from '@/types/auth';

/** 登录示例接口：入参 → Promise 数据 */
export const login = (data: LoginParams) =>
  http.post<LoginResult>('/login', data);
