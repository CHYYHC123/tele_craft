import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import router from '@/router';

// 请求失败不自动重试、切回窗口不自动重拉：错误已由请求拦截器 toast，避免失败后反复请求/反复弹提示
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
