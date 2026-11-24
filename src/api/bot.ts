import request, { http } from '@/api/request';
import type {
  AddBotParams,
  Bot,
  BotStats,
  BotWelcome,
  SubscriberPage,
  SubscribersParams,
  UpdateBotParams,
} from '@/types/bot';

/** 查询当前用户已绑定的 Bot；没有绑定过时是空数组 */
export const getBots = () => http.get<Bot[]>('/bots');

/** 添加 Bot：服务端用 token 调 Telegram getMe 校验；重复添加同一个 Bot 只会更新 */
export const addBot = (data: AddBotParams) => http.post<Bot>('/bots', data);

/** 修改 Bot 显示名和/或 About 简介（不是 @username），至少传一个字段 */
export const updateBot = (id: string, data: UpdateBotParams) =>
  http.patch<Bot>(`/bots/${id}`, data);

/** 读取 Bot 欢迎语；description 为 null 表示尚未配置 */
export const getBotWelcome = (id: string) => http.get<BotWelcome>(`/bots/${id}/welcome`);

/** 保存并发布欢迎语：先改 Telegram，成功后才写库；最长 512 个字符 */
export const updateBotWelcome = (id: string, description: string) =>
  http.put<BotWelcome>(`/bots/${id}/welcome`, { description });

/** 首页四张统计卡的数字 */
export const getBotStats = (id: string) => http.get<BotStats>(`/bots/${id}/stats`);

/** 订阅者列表：按最近活跃倒序，支持搜索与分页 */
export const getBotSubscribers = (id: string, params: SubscribersParams = {}) =>
  http.get<SubscriberPage>(`/bots/${id}/subscribers`, { params });

/** 导出订阅者 CSV（不是统一 JSON 外壳，返回 Blob） */
export const exportBotSubscribers = (id: string) =>
  request.get<Blob>(`/bots/${id}/subscribers/export`, { responseType: 'blob' }).then((r) => r.data);
