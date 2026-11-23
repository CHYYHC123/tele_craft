import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { toast } from 'sonner';

import { apiFail, apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useUserStore } from '@/store/user';
import type { TelegramLoginOptions, TelegramLoginResult } from '@/types/telegram';
import LoginPanel from '@/views/login/components/login-panel';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const auth = vi.fn();

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPanel /> },
      { path: '/', element: <h1>Home</h1> },
    ],
    { initialEntries: ['/login'] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

async function clickLogin() {
  const button = await screen.findByRole('button', { name: 'Log in via telegram' });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
}

describe('LoginPanel 弹窗登录', () => {
  beforeEach(() => {
    useUserStore.getState().logout();
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
    auth.mockReset();
    window.Telegram = {
      Login: { auth, init: vi.fn(), open: vi.fn(), close: vi.fn() },
    };
    server.use(
      http.post(`${API}/auth/telegram/sdk/nonce`, () =>
        apiOk({ nonce: 'nonce-1', clientId: '777', expiresAt: '2099-01-01T00:00:00.000Z' }),
      ),
    );
  });

  afterEach(() => {
    delete window.Telegram;
  });

  it('用后端返回的 clientId 与 nonce 打开弹窗，id_token 换到 accessToken 后进入首页', async () => {
    let loginBody: unknown;
    server.use(
      http.post(`${API}/auth/telegram/sdk/login`, async ({ request }) => {
        loginBody = await request.json();
        return apiOk({
          accessToken: 'jwt-from-server',
          expiresIn: 3600,
          user: { id: 'u1', telegramId: '42', firstName: 'Ada', lastName: '', username: 'ada' },
        });
      }),
    );

    renderLogin();
    await clickLogin();

    await waitFor(() => expect(auth).toHaveBeenCalled());
    const options = auth.mock.calls[0][0] as TelegramLoginOptions;
    const callback = auth.mock.calls[0][1] as (result: TelegramLoginResult) => void;
    expect(options).toMatchObject({ client_id: 777, scope: ['profile'], nonce: 'nonce-1' });

    act(() => {
      callback({ id_token: 'tg-id-token', user: { id: 42, nonce: 'nonce-1' } });
    });

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(loginBody).toEqual({ idToken: 'tg-id-token' });
    // 登录凭证是后端签发的 accessToken，不是 Telegram 的 id_token
    expect(useUserStore.getState().token).toBe('jwt-from-server');
    expect(useUserStore.getState().user?.telegramId).toBe('42');
    expect(toast.success).toHaveBeenCalledWith('Logged in');
  });

  it('关闭弹窗时保持未登录', async () => {
    renderLogin();
    await clickLogin();

    await waitFor(() => expect(auth).toHaveBeenCalled());
    const callback = auth.mock.calls[0][1] as (result: TelegramLoginResult) => void;
    act(() => {
      callback({ error: 'popup_closed' });
    });

    expect(toast.error).not.toHaveBeenCalled();
    expect(useUserStore.getState().token).toBeNull();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('领取 nonce 失败时不打开弹窗', async () => {
    server.use(
      http.post(`${API}/auth/telegram/sdk/nonce`, () => apiFail('1018', '服务端未配置', 500)),
    );
    renderLogin();
    await clickLogin();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('服务端未配置'));
    expect(auth).not.toHaveBeenCalled();
  });

  it('后端校验 id_token 失败时保持未登录', async () => {
    server.use(
      http.post(`${API}/auth/telegram/sdk/login`, () =>
        apiFail('UNAUTHORIZED', 'id_token 无效', 401),
      ),
    );
    renderLogin();
    await clickLogin();

    await waitFor(() => expect(auth).toHaveBeenCalled());
    const callback = auth.mock.calls[0][1] as (result: TelegramLoginResult) => void;
    act(() => {
      callback({ id_token: 'bad', user: { nonce: 'nonce-1' } });
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('id_token 无效'));
    expect(useUserStore.getState().token).toBeNull();
  });

  it('打开授权弹窗时补上当前页面的 origin', async () => {
    const opened: string[] = [];
    const originalOpen = window.open;
    window.open = ((url?: string | URL) => {
      opened.push(String(url));
      return null;
    }) as typeof window.open;
    auth.mockImplementation(() => {
      window.open(
        'https://oauth.telegram.org/auth?response_type=post_message&client_id=777',
        'telegram_oidc_login',
        'width=550,height=650',
      );
    });

    try {
      renderLogin();
      await clickLogin();

      await waitFor(() => expect(opened).toHaveLength(1));
      const authUrl = new URL(opened[0]);
      expect(authUrl.origin).toBe('https://oauth.telegram.org');
      expect(authUrl.searchParams.get('origin')).toBe(location.origin);
    } finally {
      window.open = originalOpen;
    }
  });
});
