/** 后端统一响应结构：成功时 code 固定为 "0" */
export interface ApiResponse<T> {
  code: string;
  msg: string;
  model: T;
  traceId: string;
  success: boolean;
  error: boolean;
}
