import { createElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Layout from '@/layouts';
import Home from '@/views/home';

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(Layout),
    children: [
      {
        index: true,
        element: createElement(Home)
      },
      {
        path: '*',
        element: createElement(Navigate, { to: '/', replace: true })
      }
    ]
  }
]);

export default router;
