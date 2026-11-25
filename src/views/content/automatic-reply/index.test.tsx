import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';

import { resetMockAutoReplies, resetMockBots } from '@/mocks/handlers';
import { apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useBotStore } from '@/store/bot';
import { useUserStore } from '@/store/user';
import AutomaticReply from '@/views/content/automatic-reply';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BOT = { id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'Bit Store Card' };

async function renderReceiveTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AutomaticReply />
    </QueryClientProvider>,
  );
  await userEvent.click(screen.getByRole('tab', { name: 'Receive message reply' }));
}

describe('AutomaticReply - Receive message reply', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-auto-reply',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    resetMockBots([BOT]);
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useBotStore.getState().setSelectedBotId(null);
    resetMockAutoReplies();
  });

  it('回填服务端已保存的开关和正文', async () => {
    resetMockAutoReplies({
      b1: {
        keywordEnabled: false,
        receiveEnabled: true,
        receiveContent: 'Away for now',
        keywordReplies: [],
      },
    });
    await renderReceiveTab();

    expect(await screen.findByRole('textbox', { name: /Description/ })).toHaveValue('Away for now');
    expect(screen.getByRole('switch', { name: 'Receive message reply' })).toBeChecked();
  });

  it('点保存后只提交 receiveContent，并回到不可保存状态', async () => {
    let body: unknown;
    server.use(
      http.put(`${API}/bots/b1/auto-reply`, async ({ request }) => {
        body = await request.json();
        return apiOk({
          keywordEnabled: false,
          receiveEnabled: false,
          receiveContent: 'We will reply soon.',
          keywordReplies: [],
        });
      }),
    );
    await renderReceiveTab();

    const textarea = await screen.findByRole('textbox', { name: /Description/ });
    const button = screen.getByRole('button', { name: 'Save and publish' });
    expect(button).toBeDisabled();
    await userEvent.type(textarea, 'We will reply soon.');
    await userEvent.click(button);

    await vi.waitFor(() => expect(body).toEqual({ receiveContent: 'We will reply soon.' }));
    await vi.waitFor(() => expect(button).toBeDisabled());
  });

  it('正文为空时打开开关不发请求', async () => {
    let called = false;
    server.use(
      http.put(`${API}/bots/b1/auto-reply`, () => {
        called = true;
        return apiOk({});
      }),
    );
    await renderReceiveTab();

    await screen.findByRole('textbox', { name: /Description/ });
    await userEvent.click(screen.getByRole('switch', { name: 'Receive message reply' }));

    expect(called).toBe(false);
    expect(screen.getByRole('switch', { name: 'Receive message reply' })).not.toBeChecked();
  });

  it('已有草稿、服务端正文为空时，打开开关会连同正文一起提交', async () => {
    await renderReceiveTab();

    const textarea = await screen.findByRole('textbox', { name: /Description/ });
    await userEvent.type(textarea, 'Hello there');
    await userEvent.click(screen.getByRole('switch', { name: 'Receive message reply' }));

    await vi.waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Receive message reply' })).toBeChecked(),
    );
    expect(screen.getByRole('button', { name: 'Save and publish' })).toBeDisabled();
  });
});
