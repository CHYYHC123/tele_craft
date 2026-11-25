import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logout } from '@/api/auth';
import { useUserStore } from '@/store/user';

/**
 * 退出登录：先通知后端让 accessToken 失效，无论成功与否都清掉本地登录态与缓存
 * （凭证已失效或网络失败时，用户仍应能退出）；路由守卫会跳回登录页。
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuth = useUserStore((state) => state.logout);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
};
