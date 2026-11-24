import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import Layout from '@/layouts';
import { resetMockBots, resetMockSubscribers } from '@/mocks/handlers';
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
    useUiStore.getState().closeEditBot();
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

  it('已有 Bot 时展示统计数字与订阅者行', async () => {
    resetMockBots([SAVED_BOT]);
    resetMockSubscribers([
      {
        telegramUserId: '6228099601',
        firstName: 'Olivia',
        lastName: 'Rhye',
        username: 'OliviaRhye006',
        phone: null,
        firstSeenAt: '2026-11-15T08:18:20.000Z',
        lastActiveAt: '2026-11-17T09:20:45.000Z',
      },
    ]);
    renderHome();

    expect(await screen.findByText('2,420')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('-8%')).toBeInTheDocument();
    expect(await screen.findByText('Olivia Rhye')).toBeInTheDocument();
    expect(screen.getByText('@OliviaRhye006')).toBeInTheDocument();
    expect(screen.getByText('@shop_bot')).toBeInTheDocument();
  });

  it('点击铅笔弹出改名弹窗，保存后信息条与头部显示新名字', async () => {
    resetMockBots([SAVED_BOT]);
    renderHome();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit bot' }));
    const dialog = screen.getByRole('dialog', { name: 'Modify bot information' });
    const input = screen.getByLabelText('Name');
    await userEvent.clear(input);
    await userEvent.type(input, 'Fanstore.Uz');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('button', { name: /Fanstore\.Uz/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fanstore.Uz' })).toBeInTheDocument();
    expect(dialog).not.toBeInTheDocument();
  });

  it('改名弹窗里名字为空时不能保存，Cancel 关闭弹窗', async () => {
    resetMockBots([SAVED_BOT]);
    renderHome();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit bot' }));
    await userEvent.clear(screen.getByLabelText('Name'));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('改 About：只提交变化的字段，并展示剩余字数', async () => {
    resetMockBots([{ ...SAVED_BOT, shortDescription: 'Old about' }]);
    renderHome();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit bot' }));
    expect(screen.getByLabelText('About')).toHaveValue('Old about');
    expect(screen.getByText('111 characters left')).toBeInTheDocument();
    // 没有改动时不能保存
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    const about = screen.getByLabelText('About');
    await userEvent.clear(about);
    await userEvent.type(about, 'New about');
    expect(screen.getByText('111 characters left')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // 名称未变，头部仍是原名
    expect(screen.getByRole('button', { name: /Bit Store Card/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Edit bot' }));
    expect(screen.getByLabelText('About')).toHaveValue('New about');
  });
});
