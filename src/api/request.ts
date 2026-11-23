import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { useUserStore } from '@/store/user';
import type { ApiResponse } from '@/types/api';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 为 true 时不弹全局错误提示（由调用方自行处理） */
    silent?: boolean;
  }
}

/** HTTP 2xx 但业务码非 "0" 时抛出的错误 */
export class ApiError extends Error {
  code: string;
  traceId?: string;

  constructor(code: string, msg: string, traceId?: string) {
    super(msg);
    this.name = 'ApiError';
    this.code = code;
    this.traceId = traceId;
  }
}

/** 读取错误里的业务码（HTTP 错误取响应体 code，业务错误取 ApiError.code） */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) return error.code;
  if (axios.isAxiosError<Partial<ApiResponse<unknown>>>(error)) return error.response?.data?.code;
  return undefined;
}

/**
 * 全局 axios 实例：统一 baseURL、超时、拦截器与错误处理。
 * 业务请求请通过 src/api/<module>.ts 封装的函数调用，不要在页面里直接用 axios。
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
});

// 请求拦截器：登录相关接口（/auth/）不带登录态，其余注入 Bearer accessToken
request.interceptors.request.use((config) => {
  if (config.url?.startsWith('/auth/')) return config;
  const token = useUserStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器：校验业务码 + 集中错误提示
request.interceptors.response.use(
  (response) => {
    const body = response.data as Partial<ApiResponse<unknown>> | undefined;
    if (body && typeof body === 'object' && 'code' in body && body.code !== '0') {
      const error = new ApiError(body.code ?? '', body.msg ?? '请求失败', body.traceId);
      if (!response.config.silent) toast.error(error.message);
      return Promise.reject(error);
    }
    return response;
  },
  (error: unknown) => {
    const axiosError = error as AxiosError<Partial<ApiResponse<unknown>>>;
    // 带着登录态的请求被 401 拒绝：登录已失效，清空登录态，路由守卫会跳回登录页
    if (axiosError.response?.status === 401 && axiosError.config?.headers?.Authorization) {
      useUserStore.getState().logout();
    }
    if (!axiosError.config?.silent) {
      const message =
        axiosError.response?.data?.msg ?? axiosError.message ?? '请求失败，请稍后重试';
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

/** 便捷方法：解包统一响应，直接拿到 model */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request.get<ApiResponse<T>>(url, config).then((r) => r.data.model),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.post<ApiResponse<T>>(url, data, config).then((r) => r.data.model),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.put<ApiResponse<T>>(url, data, config).then((r) => r.data.model),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request.delete<ApiResponse<T>>(url, config).then((r) => r.data.model),
};

export default request;
