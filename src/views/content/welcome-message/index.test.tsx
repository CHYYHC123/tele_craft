import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http } from 'msw';

import { resetMockBots, resetMockWelcomes } from '@/mocks/handlers';
import { apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useBotStore } from '@/store/bot';
import { useUserStore } from '@/store/user';
import WelcomeMessage from '@/views/content/welcome-message';
import {
  WELCOME_MESSAGE_MAX_LENGTH,
  WELCOME_PREVIEW_TITLE,
} from '@/views/content/welcome-message/constants';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BOT = { id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'Bit Store Card' };

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <WelcomeMessage />
    </QueryClientProvider>,
  );
}

describe('WelcomeMessage', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-welcome',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    resetMockBots([BOT]);
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useBotStore.getState().setSelectedBotId(null);
    resetMockWelcomes();
  });

  it('加载并展示已保存的欢迎语', async () => {
    resetMockWelcomes({ b1: 'Hello from server' });
    renderPage();

    const textarea = await screen.findByRole('textbox', { name: /Description/ });
    expect(textarea).toHaveValue('Hello from server');
  });

  it('编辑描述时同步更新预览和剩余字数，未修改时不能保存', async () => {
    resetMockWelcomes({ b1: 'Hello' });
    renderPage();

    const button = await screen.findByRole('button', { name: 'Save and publish' });
    expect(button).toBeDisabled();

    const textarea = screen.getByRole('textbox', { name: /Description/ });
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Hi there');

    // 限定 p，排除 textarea 自身的文本
    expect(screen.getByText('Hi there', { selector: 'p' })).toBeInTheDocument();
    expect(
      screen.getByText(`${WELCOME_MESSAGE_MAX_LENGTH - 'Hi there'.length} characters left`),
    ).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('预览顶部固定展示标题，但提交时不带上它', async () => {
    let body: unknown;
    server.use(
      http.put(`${API}/bots/b1/welcome`, async ({ request }) => {
        body = await request.json();
        return apiOk({ description: 'Hi' });
      }),
    );
    renderPage();

    const textarea = await screen.findByRole('textbox', { name: /Description/ });
    expect(screen.getByText(WELCOME_PREVIEW_TITLE)).toBeInTheDocument();
    await userEvent.type(textarea, 'Hi');
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await vi.waitFor(() => expect(body).toEqual({ description: 'Hi' }));
  });

  it('点击 Save and publish 后提交并回到不可保存状态', async () => {
    renderPage();

    const textarea = await screen.findByRole('textbox', { name: /Description/ });
    expect(textarea).toHaveValue('');
    await userEvent.type(textarea, 'New welcome');
    const button = screen.getByRole('button', { name: 'Save and publish' });
    await userEvent.click(button);

    await vi.waitFor(() => expect(button).toBeDisabled());
    expect(textarea).toHaveValue('New welcome');
  });
});
