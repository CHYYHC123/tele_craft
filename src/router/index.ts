import { createElement, lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import PageLoading from '@/components/PageLoading';
import Layout from '@/layouts';
import { RedirectIfAuthed, RequireAuth } from '@/layouts/auth-guard';

// 页面懒加载：按路由拆包，首屏只加载当前页
const Home = lazy(() => import('@/views/home'));
const WelcomeMessage = lazy(() => import('@/views/content/welcome-message'));
const GraphicMessage = lazy(() => import('@/views/content/graphic-message'));
const AutomaticReply = lazy(() => import('@/views/content/automatic-reply'));
const AddMenu = lazy(() => import('@/views/content/add-menu'));
const ButtonMenu = lazy(() => import('@/views/content/button-menu'));
const UserChat = lazy(() => import('@/views/user-chat'));
const Login = lazy(() => import('@/views/login'));
const NotFound = lazy(() => import('@/views/not-found'));

// 路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: createElement(
      RedirectIfAuthed,
      null,
      createElement(Suspense, { fallback: createElement(PageLoading) }, createElement(Login)),
    ),
  },
  {
    // 受保护区域：未登录统一跳 /login
    element: createElement(RequireAuth),
    children: [
      {
        path: '/',
        element: createElement(Layout),
        children: [
          {
            index: true,
            element: createElement(Home),
          },
          {
            path: 'content/welcome-message',
            element: createElement(WelcomeMessage),
          },
          {
            path: 'content/graphic-message',
            element: createElement(GraphicMessage),
          },
          {
            path: 'content/automatic-reply',
            element: createElement(AutomaticReply),
          },
          {
            path: 'content/add-menu',
            element: createElement(AddMenu),
          },
          {
            path: 'content/button-menu',
            element: createElement(ButtonMenu),
          },
          {
            path: 'user-chat',
            element: createElement(UserChat),
          },
          {
            path: '*',
            element: createElement(NotFound),
          },
        ],
      },
    ],
  },
]);

export default router;
