import request, { http } from '@/api/request';
import type {
  AddBotParams,
  AutoReply,
  Bot,
  BotStats,
  BotWelcome,
  StartMessage,
  StartMessageImage,
  SubscriberPage,
  SubscribersParams,
  UpdateAutoReplyParams,
  UpdateBotParams,
  UpdateStartMessageParams,
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

/** 读取开场消息（点 Start 之后的图文/纯文本）；未配置时返回空模板 */
export const getBotStartMessage = (id: string) =>
  http.get<StartMessage>(`/bots/${id}/start-message`);

/** 保存并发布开场消息：不调用 Telegram 资料接口，成功后返回已保存的内容 */
export const updateBotStartMessage = (id: string, data: UpdateStartMessageParams) =>
  http.put<StartMessage>(`/bots/${id}/start-message`, data);

/** 上传开场消息配图（PNG/JPG，≤2MB，≤640×360），multipart 字段名 file；返回公网地址 */
export const uploadBotStartMessageImage = (id: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return http.post<StartMessageImage>(`/bots/${id}/start-message/image`, form);
};

/** 读取自动回复：两个开关、兜底回复正文和全部关键词规则 */
export const getBotAutoReply = (id: string) => http.get<AutoReply>(`/bots/${id}/auto-reply`);

/** 更新自动回复开关/兜底正文：只传要改的字段；不调用 Telegram，返回完整自动回复 */
export const updateBotAutoReply = (id: string, data: UpdateAutoReplyParams) =>
  http.put<AutoReply>(`/bots/${id}/auto-reply`, data);

/** 首页四张统计卡的数字 */
export const getBotStats = (id: string) => http.get<BotStats>(`/bots/${id}/stats`);

/** 订阅者列表：按最近活跃倒序，支持搜索与分页 */
export const getBotSubscribers = (id: string, params: SubscribersParams = {}) =>
  http.get<SubscriberPage>(`/bots/${id}/subscribers`, { params });

/** 导出订阅者 CSV（不是统一 JSON 外壳，返回 Blob） */
export const exportBotSubscribers = (id: string) =>
  request.get<Blob>(`/bots/${id}/subscribers/export`, { responseType: 'blob' }).then((r) => r.data);
