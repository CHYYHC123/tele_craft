import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/auth';
import { useUserStore } from '@/store/user';

/**
 * 登录示例 hook：页面只调用此 hook，不直接碰 api。
 * 成功后把服务端返回写入客户端全局状态。
 */
export const useLogin = () => {
  const setUser = useUserStore((s) => s.setUser);
  const setToken = useUserStore((s) => s.setToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
    },
  });
};
