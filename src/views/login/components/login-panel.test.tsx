import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { toast } from 'sonner';

import { useUserStore } from '@/store/user';
import type { TelegramLoginOptions, TelegramLoginResult } from '@/types/telegram';
import LoginPanel from '@/views/login/components/login-panel';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const auth = vi.fn();

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPanel /> },
      { path: '/', element: <h1>Home</h1> },
    ],
    { initialEntries: ['/login'] },
  );
  render(<RouterProvider router={router} />);
}

async function clickLogin() {
  const button = await screen.findByRole('button', { name: 'Log in via telegram' });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
  return button;
}

describe('LoginPanel Telegram login', () => {
  beforeEach(() => {
    useUserStore.getState().logout();
    vi.stubEnv('VITE_TELEGRAM_CLIENT_ID', '123456789');
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
    auth.mockReset();
    window.Telegram = {
      Login: { auth, init: vi.fn(), open: vi.fn(), close: vi.fn() },
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.Telegram;
  });

  it('用官方 SDK 打开登录弹窗，成功后写入用户并进入首页', async () => {
    renderLogin();
    await clickLogin();

    const options = auth.mock.calls[0][0] as TelegramLoginOptions;
    const callback = auth.mock.calls[0][1] as (result: TelegramLoginResult) => void;
    expect(options).toMatchObject({ client_id: 123456789, scope: ['profile'], lang: 'en' });
    expect(options.nonce).toEqual(expect.any(String));

    act(() => {
      callback({
        id_token: 'id-token',
        user: {
          id: 42,
          name: 'Ada',
          picture: 'https://cdn.example/a.png',
          nonce: options.nonce,
        },
      });
    });

    expect(useUserStore.getState().token).toBe('id-token');
    expect(useUserStore.getState().user).toEqual({
      id: '42',
      name: 'Ada',
      avatar: 'https://cdn.example/a.png',
    });
    expect(toast.success).toHaveBeenCalledWith('Logged in');
    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('关闭弹窗时保持未登录', async () => {
    renderLogin();
    await clickLogin();

    const callback = auth.mock.calls[0][1] as (result: TelegramLoginResult) => void;
    act(() => {
      callback({ error: 'popup_closed' });
    });

    expect(toast.error).not.toHaveBeenCalled();
    expect(useUserStore.getState().user).toBeNull();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
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
        'https://oauth.telegram.org/auth?response_type=post_message&client_id=123456789',
        'telegram_oidc_login',
        'width=550,height=650',
      );
    });

    try {
      renderLogin();
      await clickLogin();

      const authUrl = new URL(opened[0]);
      expect(authUrl.origin).toBe('https://oauth.telegram.org');
      expect(authUrl.searchParams.get('origin')).toBe(location.origin);
    } finally {
      window.open = originalOpen;
    }
  });

  it('未配置 Client ID 时不打开弹窗', async () => {
    vi.stubEnv('VITE_TELEGRAM_CLIENT_ID', '');
    renderLogin();
    await clickLogin();

    expect(auth).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'Set VITE_TELEGRAM_CLIENT_ID before logging in with Telegram',
    );
  });
});
