import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { apiFail, apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useUserStore } from '@/store/user';
import type { LoginSessionState } from '@/types/auth';
import { useTelegramQrLogin } from '@/views/login/hooks/useTelegramQrLogin';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TOKEN = 'A'.repeat(22);

function Probe() {
  const { deepLink, status } = useTelegramQrLogin();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="link">{deepLink}</span>
    </div>
  );
}

function renderProbe() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <Probe /> },
      { path: '/', element: <h1>Home</h1> },
    ],
    { initialEntries: ['/login'] },
  );
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function mockSession(state: LoginSessionState, counters = { created: 0 }) {
  server.use(
    http.post(`${API}/auth/telegram/sessions`, () => {
      counters.created += 1;
      return apiOk({
        token: TOKEN,
        deepLink: `https://t.me/bot?start=login_${TOKEN}`,
        expiresAt: '2099-01-01T00:00:00.000Z',
        clientSecret: 'client-secret',
      });
    }),
    http.get(`${API}/auth/telegram/sessions/:token`, () => apiOk(state)),
  );
  return counters;
}

describe('useTelegramQrLogin', () => {
  beforeEach(() => {
    useUserStore.getState().logout();
  });

  it('创建会话后展示 deepLink，pending 状态保持等待', async () => {
    mockSession({ status: 'pending', scannedBy: null, user: null });
    renderProbe();

    await waitFor(() => expect(screen.getByTestId('link')).toHaveTextContent(TOKEN));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('pending'));
  });

  it('confirmed 后用 clientSecret 兑换，写入登录态并进入首页（只兑换一次）', async () => {
    const profile = { id: '9', firstName: 'Ada', lastName: '', username: 'ada' };
    mockSession({ status: 'confirmed', scannedBy: null, user: profile });
    const exchangeBodies: unknown[] = [];
    server.use(
      http.post(`${API}/auth/telegram/sessions/:token/exchange`, async ({ request }) => {
        exchangeBodies.push(await request.json());
        return apiOk({
          accessToken: 'jwt-qr',
          expiresIn: 3600,
          user: { id: 'u1', telegramId: '9', firstName: 'Ada', lastName: '', username: 'ada' },
        });
      }),
    );

    renderProbe();

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(exchangeBodies).toEqual([{ clientSecret: 'client-secret' }]);
    expect(useUserStore.getState().token).toBe('jwt-qr');
  });

  it('兑换失败（409）后自动重新创建会话', async () => {
    const counters = mockSession({ status: 'confirmed', scannedBy: null, user: null });
    server.use(
      http.post(`${API}/auth/telegram/sessions/:token/exchange`, () =>
        apiFail('1006', '会话不存在', 409),
      ),
    );

    renderProbe();

    await waitFor(() => expect(counters.created).toBeGreaterThanOrEqual(2));
    expect(useUserStore.getState().token).toBeNull();
  });

  it('会话过期后自动重新创建会话', async () => {
    const counters = mockSession({ status: 'expired', scannedBy: null, user: null });
    renderProbe();

    await waitFor(() => expect(counters.created).toBeGreaterThanOrEqual(2));
  });
});
