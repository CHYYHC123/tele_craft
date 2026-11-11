import { createElement, lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import Layout from '@/layouts';

// 页面懒加载：按路由拆包，首屏只加载当前页
const Home = lazy(() => import('@/views/home'));
const NotFound = lazy(() => import('@/views/not-found'));

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(Layout),
    children: [
      {
        index: true,
        element: createElement(Home),
      },
      {
        path: '*',
        element: createElement(NotFound),
      },
    ],
  },
]);

export default router;
