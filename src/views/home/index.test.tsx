import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import Layout from '@/layouts';
import { resetMockBots } from '@/mocks/handlers';
import { useBotStore } from '@/store/bot';
import { useUiStore } from '@/store/ui';
import { useUserStore } from '@/store/user';
import Home from '@/views/home';
import UserChat from '@/views/user-chat';

function renderHome() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'user-chat', element: <UserChat /> },
        ],
      },
    ],
    { initialEntries: ['/'] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const SAVED_BOT = {
  id: 'b1',
  telegramBotId: '7',
  username: 'shop_bot',
  displayName: 'Bit Store Card',
};

describe('Home', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-home',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: 'Ada', lastName: '', username: 'ada' },
    });
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useUiStore.getState().closeAddBot();
    useBotStore.getState().setSelectedBotId(null);
  });

  it('没有用户数据时展示空状态', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: 'User information' })).toBeInTheDocument();
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('侧栏能从 Home 进入 User chat', async () => {
    renderHome();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(screen.getByRole('link', { name: 'User chat' }));

    expect(screen.getByRole('link', { name: 'User chat' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current', 'page');
  });

  it('没有 Bot 时自动弹出添加弹窗，添加后头部变为 Bot 选择器', async () => {
    renderHome();

    const dialog = await screen.findByRole('dialog', { name: 'Add a bot' });
    expect(screen.getByRole('heading', { name: "Let's add a bot" })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Bot API key'), '7:ABCdef');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByRole('button', { name: /Bit Store Card/ })).toBeInTheDocument();
    expect(dialog).not.toBeInTheDocument();
  });

  it('关闭弹窗后可通过头部按钮再次打开', async () => {
    renderHome();

    await screen.findByRole('dialog', { name: 'Add a bot' });
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add a bot' }));
    expect(screen.getByRole('dialog', { name: 'Add a bot' })).toBeInTheDocument();
  });

  it('已有 Bot 时不弹窗，头部展示 Bot 选择器', async () => {
    resetMockBots([SAVED_BOT]);
    renderHome();

    expect(await screen.findByRole('button', { name: /Bit Store Card/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
