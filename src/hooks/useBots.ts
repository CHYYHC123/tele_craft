import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  addBot,
  addBotKeywordReply,
  createBotKeyboardButton,
  createBotMenu,
  deleteBotKeyboardButton,
  deleteBotKeywordReply,
  deleteBotMenu,
  exportBotSubscribers,
  getBotAutoReply,
  getBotKeyboard,
  getBotMenus,
  getBotStats,
  getBotSubscribers,
  getBotStartMessage,
  getBotWelcome,
  getBots,
  updateBot,
  updateBotAutoReply,
  updateBotKeyboardButton,
  updateBotKeyboardLayout,
  updateBotKeywordReply,
  updateBotMenu,
  updateBotStartMessage,
  updateBotWelcome,
  uploadBotKeyboardImage,
  uploadBotMenuImage,
  uploadBotStartMessageImage,
} from '@/api/bot';
import { useBotStore } from '@/store/bot';
import { useUiStore } from '@/store/ui';
import { selectIsLoggedIn, useUserStore } from '@/store/user';
import type {
  AutoReply,
  BotMenu,
  BotMenuParams,
  KeyboardButtonParams,
  KeyboardLayout,
  KeywordReplyParams,
  SubscribersParams,
  UpdateAutoReplyParams,
  UpdateBotParams,
  UpdateStartMessageParams,
} from '@/types/bot';
import { downloadBlob } from '@/utils/download';

export const BOTS_QUERY_KEY = ['bots'] as const;
export const botStatsQueryKey = (botId: string | undefined) => ['bots', botId, 'stats'] as const;
export const botWelcomeQueryKey = (botId: string | undefined) =>
  ['bots', botId, 'welcome'] as const;
export const botStartMessageQueryKey = (botId: string | undefined) =>
  ['bots', botId, 'start-message'] as const;
export const botAutoReplyQueryKey = (botId: string | undefined) =>
  ['bots', botId, 'auto-reply'] as const;
export const botMenusQueryKey = (botId: string | undefined) => ['bots', botId, 'menus'] as const;
export const botKeyboardQueryKey = (botId: string | undefined) =>
  ['bots', botId, 'keyboard'] as const;
export const botSubscribersQueryKey = (botId: string | undefined, params: SubscribersParams) =>
  ['bots', botId, 'subscribers', params] as const;

/** 当前登录用户的 Bot 列表；未登录时不请求 */
export const useBotsQuery = () => {
  const isLoggedIn = useUserStore(selectIsLoggedIn);
  return useQuery({ queryKey: BOTS_QUERY_KEY, queryFn: getBots, enabled: isLoggedIn });
};

/** 添加 Bot：成功后刷新列表、选中新 Bot、关闭弹窗；错误由请求拦截器统一 toast */
export const useAddBot = () => {
  const queryClient = useQueryClient();
  const setSelectedBotId = useBotStore((state) => state.setSelectedBotId);
  const closeAddBot = useUiStore((state) => state.closeAddBot);

  return useMutation({
    mutationFn: addBot,
    onSuccess: async (bot) => {
      await queryClient.invalidateQueries({ queryKey: BOTS_QUERY_KEY });
      setSelectedBotId(bot.id);
      closeAddBot();
      toast.success('Bot added');
    },
  });
};

/** 首页统计卡数据；没有 Bot 时不请求 */
export const useBotStatsQuery = (botId: string | undefined) =>
  useQuery({
    queryKey: botStatsQueryKey(botId),
    queryFn: () => getBotStats(botId as string),
    enabled: !!botId,
  });

/** 订阅者列表（搜索 + 分页）；翻页时保留上一页数据避免闪烁 */
export const useBotSubscribersQuery = (botId: string | undefined, params: SubscribersParams) =>
  useQuery({
    queryKey: botSubscribersQueryKey(botId, params),
    queryFn: () => getBotSubscribers(botId as string, params),
    enabled: !!botId,
    placeholderData: keepPreviousData,
  });

/** 修改 Bot 名称/简介：成功后刷新列表、关闭弹窗；错误由请求拦截器统一 toast */
export const useUpdateBot = () => {
  const queryClient = useQueryClient();
  const closeEditBot = useUiStore((state) => state.closeEditBot);

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateBotParams) => updateBot(id, data),
    onSuccess: async () => {
      // 只刷新 Bot 列表（exact），不连带重拉该 Bot 的统计与订阅者
      await queryClient.invalidateQueries({ queryKey: BOTS_QUERY_KEY, exact: true });
      closeEditBot();
      toast.success('Saved successfully');
    },
  });
};

/** Bot 欢迎语；没有 Bot 时不请求 */
export const useBotWelcomeQuery = (botId: string | undefined) =>
  useQuery({
    queryKey: botWelcomeQueryKey(botId),
    queryFn: () => getBotWelcome(botId as string),
    enabled: !!botId,
  });

/** Bot 开场消息（点 Start 之后发出的消息）；没有 Bot 时不请求 */
export const useBotStartMessageQuery = (botId: string | undefined) =>
  useQuery({
    queryKey: botStartMessageQueryKey(botId),
    queryFn: () => getBotStartMessage(botId as string),
    enabled: !!botId,
  });

/** 保存并发布欢迎语：成功后用服务端返回值更新缓存；错误由请求拦截器统一 toast */
export const useUpdateBotWelcome = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (description: string) => updateBotWelcome(botId as string, description),
    onSuccess: (welcome) => {
      queryClient.setQueryData(botWelcomeQueryKey(botId), welcome);
      toast.success('Welcome message published');
    },
  });
};

/** 保存并发布开场消息：成功后用服务端返回值更新缓存；错误由请求拦截器统一 toast */
export const useUpdateBotStartMessage = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStartMessageParams) => updateBotStartMessage(botId as string, data),
    onSuccess: (startMessage) => {
      queryClient.setQueryData(botStartMessageQueryKey(botId), startMessage);
      toast.success('Start message published');
    },
  });
};

/** Bot 自动回复（开关、兜底正文、关键词规则）；没有 Bot 时不请求 */
export const useBotAutoReplyQuery = (botId: string | undefined) =>
  useQuery({
    queryKey: botAutoReplyQueryKey(botId),
    queryFn: () => getBotAutoReply(botId as string),
    enabled: !!botId,
  });

/** 更新自动回复：成功后用服务端返回的完整数据覆盖缓存；错误由请求拦截器统一 toast */
export const useUpdateBotAutoReply = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAutoReplyParams) => updateBotAutoReply(botId as string, data),
    onSuccess: (autoReply) => {
      queryClient.setQueryData(botAutoReplyQueryKey(botId), autoReply);
    },
  });
};

/** 新增关键词回复：成功后把新规则追加进自动回复缓存；错误由请求拦截器统一 toast */
export const useAddKeywordReply = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KeywordReplyParams) => addBotKeywordReply(botId as string, data),
    onSuccess: (rule) => {
      queryClient.setQueryData<AutoReply>(botAutoReplyQueryKey(botId), (old) =>
        old ? { ...old, keywordReplies: [...old.keywordReplies, rule] } : old,
      );
      toast.success('Reply added');
    },
  });
};

/** 修改关键词回复：成功后替换缓存里对应的规则 */
export const useUpdateKeywordReply = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, ...data }: { replyId: string } & KeywordReplyParams) =>
      updateBotKeywordReply(botId as string, replyId, data),
    onSuccess: (rule) => {
      queryClient.setQueryData<AutoReply>(botAutoReplyQueryKey(botId), (old) =>
        old
          ? {
              ...old,
              keywordReplies: old.keywordReplies.map((item) => (item.id === rule.id ? rule : item)),
            }
          : old,
      );
      toast.success('Reply saved');
    },
  });
};

/** 删除关键词回复：成功后从缓存里移除，开关状态不变 */
export const useDeleteKeywordReply = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => deleteBotKeywordReply(botId as string, replyId),
    onSuccess: (_data, replyId) => {
      queryClient.setQueryData<AutoReply>(botAutoReplyQueryKey(botId), (old) =>
        old
          ? { ...old, keywordReplies: old.keywordReplies.filter((item) => item.id !== replyId) }
          : old,
      );
      toast.success('Reply deleted');
    },
  });
};

/** 上传开场消息配图，只拿到公网地址；不改缓存，保存消息时再带上这个地址 */
export const useUploadStartMessageImage = (botId: string | undefined) =>
  useMutation({
    mutationFn: (file: File) => uploadBotStartMessageImage(botId as string, file),
  });

/** 命令菜单（不含 /start）；没有 Bot 时不请求，未配置时是空数组 */
export const useBotMenusQuery = (botId: string | undefined) =>
  useQuery({
    queryKey: botMenusQueryKey(botId),
    queryFn: () => getBotMenus(botId as string),
    enabled: !!botId,
  });

/** 新建并发布菜单：成功后追加到缓存末尾；错误由请求拦截器统一 toast */
export const useCreateBotMenu = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BotMenuParams) => createBotMenu(botId as string, data),
    onSuccess: (menu) => {
      queryClient.setQueryData<BotMenu[]>(botMenusQueryKey(botId), (old) =>
        old ? [...old, menu] : [menu],
      );
      toast.success('Menu published');
    },
  });
};

/** 修改并发布菜单：成功后替换缓存里对应的一项 */
export const useUpdateBotMenu = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuId, ...data }: { menuId: string } & BotMenuParams) =>
      updateBotMenu(botId as string, menuId, data),
    onSuccess: (menu) => {
      queryClient.setQueryData<BotMenu[]>(botMenusQueryKey(botId), (old) =>
        old?.map((item) => (item.id === menu.id ? menu : item)),
      );
      toast.success('Menu published');
    },
  });
};

/** 删除菜单：成功后从缓存里移除 */
export const useDeleteBotMenu = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuId: string) => deleteBotMenu(botId as string, menuId),
    onSuccess: (_data, menuId) => {
      queryClient.setQueryData<BotMenu[]>(botMenusQueryKey(botId), (old) =>
        old?.filter((item) => item.id !== menuId),
      );
      toast.success('Menu deleted');
    },
  });
};

/** 上传菜单配图，只拿到公网地址；不改缓存，保存菜单时再带上这个地址 */
export const useUploadBotMenuImage = (botId: string | undefined) =>
  useMutation({
    mutationFn: (file: File) => uploadBotMenuImage(botId as string, file),
  });

/** 键盘按钮布局；没有 Bot 时不请求，未配置时 rows 是空数组 */
export const useBotKeyboardQuery = (botId: string | undefined) =>
  useQuery({
    queryKey: botKeyboardQueryKey(botId),
    queryFn: () => getBotKeyboard(botId as string),
    enabled: !!botId,
  });

/** 新增键盘按钮：成功后追加到缓存末尾，自成一行；错误由请求拦截器统一 toast */
export const useCreateKeyboardButton = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KeyboardButtonParams) => createBotKeyboardButton(botId as string, data),
    onSuccess: (button) => {
      queryClient.setQueryData<KeyboardLayout>(botKeyboardQueryKey(botId), (old) => ({
        rows: [...(old?.rows ?? []), [button]],
      }));
      toast.success('Button saved');
    },
  });
};

/** 修改键盘按钮：成功后替换缓存里对应的一项，位置不变 */
export const useUpdateKeyboardButton = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ buttonId, ...data }: { buttonId: string } & KeyboardButtonParams) =>
      updateBotKeyboardButton(botId as string, buttonId, data),
    onSuccess: (button) => {
      queryClient.setQueryData<KeyboardLayout>(botKeyboardQueryKey(botId), (old) =>
        old
          ? {
              rows: old.rows.map((row) =>
                row.map((item) => (item.id === button.id ? button : item)),
              ),
            }
          : old,
      );
      toast.success('Button saved');
    },
  });
};

/** 删除键盘按钮：成功后从缓存里移除，并去掉空行 */
export const useDeleteKeyboardButton = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (buttonId: string) => deleteBotKeyboardButton(botId as string, buttonId),
    onSuccess: (_data, buttonId) => {
      queryClient.setQueryData<KeyboardLayout>(botKeyboardQueryKey(botId), (old) =>
        old
          ? {
              rows: old.rows
                .map((row) => row.filter((item) => item.id !== buttonId))
                .filter((row) => row.length > 0),
            }
          : old,
      );
      toast.success('Button deleted');
    },
  });
};

/** 提交键盘布局（按钮 id 二维数组）：成功后用服务端返回的布局覆盖缓存 */
export const useUpdateKeyboardLayout = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: string[][]) => updateBotKeyboardLayout(botId as string, rows),
    onSuccess: (layout) => {
      queryClient.setQueryData(botKeyboardQueryKey(botId), layout);
    },
  });
};

/** 上传键盘按钮配图，只拿到公网地址；不改缓存，保存按钮时再带上这个地址 */
export const useUploadKeyboardImage = (botId: string | undefined) =>
  useMutation({
    mutationFn: (file: File) => uploadBotKeyboardImage(botId as string, file),
  });

/** 导出订阅者 CSV 并触发浏览器下载 */
export const useExportSubscribers = () =>
  useMutation({
    mutationFn: async (botId: string) => {
      const blob = await exportBotSubscribers(botId);
      downloadBlob(blob, 'subscribers.csv');
    },
  });
