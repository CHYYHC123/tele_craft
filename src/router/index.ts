import { createElement, lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import PageLoading from '@/components/PageLoading';
import Layout from '@/layouts';

// 页面懒加载：按路由拆包，首屏只加载当前页
const Home = lazy(() => import('@/views/home'));
const WelcomeMessage = lazy(() => import('@/views/content/welcome-message'));
const GraphicMessage = lazy(() => import('@/views/content/graphic-message'));
const AutomaticReply = lazy(() => import('@/views/content/automatic-reply'));
const AddMenu = lazy(() => import('@/views/content/add-menu'));
const UserChat = lazy(() => import('@/views/user-chat'));
const Login = lazy(() => import('@/views/login'));
const NotFound = lazy(() => import('@/views/not-found'));

// 路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: createElement(
      Suspense,
      { fallback: createElement(PageLoading) },
      createElement(Login),
    ),
  },
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
        path: 'user-chat',
        element: createElement(UserChat),
      },
      {
        path: '*',
        element: createElement(NotFound),
      },
    ],
  },
]);

export default router;
