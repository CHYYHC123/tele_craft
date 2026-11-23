import { http } from '@/api/request';
import type { AddBotParams, Bot } from '@/types/bot';

/** 查询当前用户已绑定的 Bot；没有绑定过时是空数组 */
export const getBots = () => http.get<Bot[]>('/bots');

/** 添加 Bot：服务端用 token 调 Telegram getMe 校验；重复添加同一个 Bot 只会更新 */
export const addBot = (data: AddBotParams) => http.post<Bot>('/bots', data);
