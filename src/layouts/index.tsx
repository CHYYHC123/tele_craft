import type { FC } from 'react';
import { Outlet } from 'react-router';

import LayoutContainer from '@/layouts/layout-container';

const Layout: FC = () => {
  return (
    <LayoutContainer>
      <Outlet />
    </LayoutContainer>
  );
};

export default Layout;
