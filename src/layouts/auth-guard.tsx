import type { FC, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { selectIsLoggedIn, useUserStore } from '@/store/user';

/** 未登录（或登录已过期）访问受保护页面时，跳转到登录页 */
export const RequireAuth: FC = () => {
  const loggedIn = useUserStore(selectIsLoggedIn);
  return loggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

/** 已登录访问登录页时，跳转到首页 */
export const RedirectIfAuthed: FC<{ children: ReactNode }> = ({ children }) => {
  const loggedIn = useUserStore(selectIsLoggedIn);
  return loggedIn ? <Navigate to="/" replace /> : children;
};
