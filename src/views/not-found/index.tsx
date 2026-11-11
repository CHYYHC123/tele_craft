import type { FC } from 'react';
import { Link } from 'react-router';

const NotFound: FC = () => {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold tracking-tight">404</p>
      <p className="text-gray-500">页面不存在</p>
      <Link to="/" className="rounded-md bg-black px-4 py-2 text-sm text-white">
        返回首页
      </Link>
    </main>
  );
};

export default NotFound;
