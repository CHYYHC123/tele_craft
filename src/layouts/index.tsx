import { Suspense, type FC } from 'react';
import { Outlet } from 'react-router';

import PageLoading from '@/components/PageLoading';
import AddBotDialog from '@/layouts/add-bot-dialog';
import AppHeader from '@/layouts/app-header';
import AppSidebar from '@/layouts/app-sidebar';

const Layout: FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#191b26] antialiased">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="min-w-0 flex-1 p-6">
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <AddBotDialog />
    </div>
  );
};

export default Layout;
