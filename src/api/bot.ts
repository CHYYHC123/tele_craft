import request, { http } from '@/api/request';
import type {
  AddBotParams,
  AutoReply,
  Bot,
  BotStats,
  BotWelcome,
  KeyboardButton,
  KeyboardButtonParams,
  KeyboardImage,
  KeyboardLayout,
  KeywordReplyParams,
  KeywordReplyRule,
  MenuStrategy,
  MenuStrategyParams,
  BotMenu,
  BotMenuImage,
  BotMenuParams,
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

/** 新增关键词回复：私聊整句命中任一关键词时回这条内容（忽略大小写、去首尾空格） */
export const addBotKeywordReply = (id: string, data: KeywordReplyParams) =>
  http.post<KeywordReplyRule>(`/bots/${id}/keyword-replies`, data);

/** 修改关键词回复：关键词按这次提交整批替换 */
export const updateBotKeywordReply = (id: string, replyId: string, data: KeywordReplyParams) =>
  http.put<KeywordReplyRule>(`/bots/${id}/keyword-replies/${replyId}`, data);

/** 删除关键词回复及其全部关键词；成功时 model 为 null，开关状态不变 */
export const deleteBotKeywordReply = (id: string, replyId: string) =>
  http.delete<null>(`/bots/${id}/keyword-replies/${replyId}`);

/** 读取命令菜单；未配置时是空数组，不含 /start */
export const getBotMenus = (id: string) => http.get<BotMenu[]>(`/bots/${id}/menus`);

/** 上传菜单配图（PNG/JPG，≤2MB，≤640×360），multipart 字段名 file；不改已发布的菜单 */
export const uploadBotMenuImage = (id: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return http.post<BotMenuImage>(`/bots/${id}/menus/image`, form);
};

/** 新建并发布一条命令菜单，排在末尾 */
export const createBotMenu = (id: string, data: BotMenuParams) =>
  http.post<BotMenu>(`/bots/${id}/menus`, data);

/** 修改并发布一条命令菜单，请求体与新建相同 */
export const updateBotMenu = (id: string, menuId: string, data: BotMenuParams) =>
  http.put<BotMenu>(`/bots/${id}/menus/${menuId}`, data);

/** 删除一条命令菜单；成功时 model 为 null，这项的配图一并删除 */
export const deleteBotMenu = (id: string, menuId: string) =>
  http.delete<null>(`/bots/${id}/menus/${menuId}`);

/** 读取键盘按钮布局；按行分组，未配置时 rows 为空数组 */
export const getBotKeyboard = (id: string) => http.get<KeyboardLayout>(`/bots/${id}/keyboard`);

/** 上传键盘按钮配图（PNG/JPG，≤2MB，≤640×360），multipart 字段名 file；不改已保存的按钮 */
export const uploadBotKeyboardImage = (id: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return http.post<KeyboardImage>(`/bots/${id}/keyboard/image`, form);
};

/** 新增键盘按钮，自成一行放在最后 */
export const createBotKeyboardButton = (id: string, data: KeyboardButtonParams) =>
  http.post<KeyboardButton>(`/bots/${id}/keyboard/buttons`, data);

/** 修改键盘按钮内容，位置不变，请求体与新增相同 */
export const updateBotKeyboardButton = (id: string, buttonId: string, data: KeyboardButtonParams) =>
  http.put<KeyboardButton>(`/bots/${id}/keyboard/buttons/${buttonId}`, data);

/** 删除键盘按钮；成功时 model 为 null，右边的按钮左移，空行消失 */
export const deleteBotKeyboardButton = (id: string, buttonId: string) =>
  http.delete<null>(`/bots/${id}/keyboard/buttons/${buttonId}`);

/** 提交整份键盘布局：外层是行，内层是该行从左到右的按钮 id；必须带全部按钮，每行 1-3 个 */
export const updateBotKeyboardLayout = (id: string, rows: string[][]) =>
  http.put<KeyboardLayout>(`/bots/${id}/keyboard/layout`, { rows });

/** 读取下发策略；还没保存过时返回默认值：开启、command、没有默认菜单项 */
export const getBotMenuStrategy = (id: string) =>
  http.get<MenuStrategy>(`/bots/${id}/menu-strategy`);

/** 保存下发策略：服务端先同步 Telegram 命令列表，成功后才写库；返回已保存的策略 */
export const updateBotMenuStrategy = (id: string, data: MenuStrategyParams) =>
  http.put<MenuStrategy>(`/bots/${id}/menu-strategy`, data);

/** 首页四张统计卡的数字 */
export const getBotStats = (id: string) => http.get<BotStats>(`/bots/${id}/stats`);

/** 订阅者列表：按最近活跃倒序，支持搜索与分页 */
export const getBotSubscribers = (id: string, params: SubscribersParams = {}) =>
  http.get<SubscriberPage>(`/bots/${id}/subscribers`, { params });

/** 导出订阅者 CSV（不是统一 JSON 外壳，返回 Blob） */
export const exportBotSubscribers = (id: string) =>
  request.get<Blob>(`/bots/${id}/subscribers/export`, { responseType: 'blob' }).then((r) => r.data);
