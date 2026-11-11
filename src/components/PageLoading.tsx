import type { FC } from 'react';

/** 路由懒加载时的占位 loading */
const PageLoading: FC = () => {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
    </div>
  );
};

export default PageLoading;
