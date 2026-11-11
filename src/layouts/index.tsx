import { Suspense, type FC } from 'react';
import { Outlet } from 'react-router';

import LayoutContainer from '@/layouts/layout-container';
import PageLoading from '@/components/PageLoading';

const Layout: FC = () => {
  return (
    <LayoutContainer>
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
    </LayoutContainer>
  );
};

export default Layout;
