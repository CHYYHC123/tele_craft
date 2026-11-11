import axios, { type AxiosRequestConfig } from 'axios';

/**
 * 全局 axios 实例：统一 baseURL、超时、拦截器与错误处理。
 * 业务请求请通过 src/api/<module>.ts 封装的函数调用，不要在页面里直接用 axios。
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
});

// 请求拦截器：可在此注入 token 等
request.interceptors.request.use((config) => {
  // const token = useUserStore.getState().token;
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器：统一剥离 data、集中处理错误
request.interceptors.response.use(
  (response) => response,
  (error) => {
    // 可在此做全局错误提示 / 401 跳转登录等
    return Promise.reject(error);
  },
);

/** 便捷方法：直接拿到响应体 data */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.post<T>(url, data, config).then((r) => r.data),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.put<T>(url, data, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request.delete<T>(url, config).then((r) => r.data),
};

export default request;
