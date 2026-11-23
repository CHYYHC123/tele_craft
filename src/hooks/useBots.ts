import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { addBot, getBots } from '@/api/bot';
import { useBotStore } from '@/store/bot';
import { useUiStore } from '@/store/ui';
import { selectIsLoggedIn, useUserStore } from '@/store/user';

export const BOTS_QUERY_KEY = ['bots'] as const;

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
