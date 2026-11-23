import { HttpResponse } from 'msw';
import type { ApiResponse } from '@/types/api';

/** 按后端统一响应结构构造成功响应 */
export const apiOk = <T>(model: T) =>
  HttpResponse.json<ApiResponse<T>>({
    code: '0',
    msg: 'success',
    model,
    traceId: 'mock-trace-id',
    success: true,
    error: false,
  });

/** 按后端统一响应结构构造失败响应（HTTP 状态码与业务码都可指定） */
export const apiFail = (code: string, msg: string, status: number, model: unknown = null) =>
  HttpResponse.json<ApiResponse<unknown>>(
    { code, msg, model, traceId: 'mock-trace-id', success: false, error: true },
    { status },
  );
