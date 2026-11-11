import type { FC } from 'react';

import LoginPanel from '@/views/login/components/login-panel';
import LoginShowcase from '@/views/login/components/login-showcase';

const Login: FC = () => {
  return (
    <main className="flex min-h-screen overflow-x-hidden bg-white text-neutral-900">
      <LoginShowcase />
      <LoginPanel />
    </main>
  );
};

export default Login;
