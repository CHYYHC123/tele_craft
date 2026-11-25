import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';

import { resetMockBots, resetMockStartMessages } from '@/mocks/handlers';
import { apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useBotStore } from '@/store/bot';
import { useUserStore } from '@/store/user';
import type { UpdateStartMessageParams } from '@/types/bot';
import GraphicMessage from '@/views/content/graphic-message';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BOT = { id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'Bit Store Card' };
const BLOB_URL = 'https://example.blob.upstash.io/bots/b1/banner.jpg';

/** 记录保存开场消息的请求体 */
function captureStartMessagePut() {
  const captured: { body?: UpdateStartMessageParams } = {};
  server.use(
    http.put(`${API}/bots/b1/start-message`, async ({ request }) => {
      captured.body = (await request.json()) as UpdateStartMessageParams;
      return apiOk(captured.body);
    }),
  );
  return captured;
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <GraphicMessage />
    </QueryClientProvider>,
  );
}

describe('GraphicMessage', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-graphic',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    resetMockBots([BOT]);
    // 默认预置为图文消息，保证图片上传区可见
    resetMockStartMessages({
      b1: {
        messageType: 'graphic',
        imageUrl: null,
        description: '',
        buttonsEnabled: false,
        buttons: [],
      },
    });
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useBotStore.getState().setSelectedBotId(null);
    resetMockStartMessages();
  });

  it('切换到文本消息后隐藏图片上传', async () => {
    renderPage();

    expect(await screen.findByText('Click to upload')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));

    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument();
  });

  it('开启操作按钮并填写名称后，在预览里显示', async () => {
    renderPage();

    await screen.findByRole('switch', { name: 'Action button' });
    expect(screen.queryByLabelText('Button name')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));
    await userEvent.type(screen.getByLabelText('Button name'), 'Pay now');

    expect(screen.getByText('Pay now', { selector: 'li' })).toBeInTheDocument();
  });

  it('可以新增并删除操作按钮', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('switch', { name: 'Action button' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add new action button' }));

    expect(screen.getAllByLabelText('Button name')).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Remove action button' }));

    expect(screen.getAllByLabelText('Button name')).toHaveLength(1);
  });

  it('回填服务端的开场消息，并在预览里显示 Bot 名称', async () => {
    resetMockStartMessages({
      b1: {
        messageType: 'graphic',
        imageUrl: 'https://example.blob.upstash.io/bots/b1/banner.jpg',
        description: 'Hello from server',
        buttonsEnabled: true,
        buttons: [{ name: 'Crypto Pay', url: 'https://example.com/pay' }],
      },
    });
    renderPage();

    expect(await screen.findByRole('textbox', { name: 'Description' })).toHaveValue(
      'Hello from server',
    );
    expect(screen.getByText('banner.jpg')).toBeInTheDocument();
    expect(screen.getByLabelText('Button name')).toHaveValue('Crypto Pay');
    expect(screen.getByLabelText('External link')).toHaveValue('https://example.com/pay');
    expect(screen.getByText('Crypto Pay', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByText(BOT.displayName)).toBeInTheDocument();
  });

  it('保存时沿用已发布的图片地址，并提交表单内容（空按钮行不提交）', async () => {
    resetMockStartMessages({
      b1: {
        messageType: 'graphic',
        imageUrl: BLOB_URL,
        description: 'Hello from server',
        buttonsEnabled: true,
        buttons: [{ name: 'Crypto Pay', url: 'https://example.com/pay' }],
      },
    });
    const captured = captureStartMessagePut();
    renderPage();

    await screen.findByRole('textbox', { name: 'Description' });
    await userEvent.click(screen.getByRole('button', { name: 'Add new action button' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(captured.body).toBeDefined());
    expect(captured.body).toEqual({
      messageType: 'graphic',
      imageUrl: BLOB_URL,
      description: 'Hello from server',
      buttonsEnabled: true,
      buttons: [{ name: 'Crypto Pay', url: 'https://example.com/pay' }],
    });
  });

  it('选了新图片时，先上传拿到地址，再带着地址保存', async () => {
    const captured = captureStartMessagePut();
    renderPage();

    const file = new File(['png'], 'banner.jpg', { type: 'image/jpeg' });
    await userEvent.upload(await screen.findByLabelText(/Click to upload/), file);
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(captured.body).toBeDefined());
    expect(captured.body).toMatchObject({ messageType: 'graphic', imageUrl: BLOB_URL });
  });

  it('切换到文本消息后保存，图片地址会被清空', async () => {
    resetMockStartMessages({
      b1: {
        messageType: 'graphic',
        imageUrl: BLOB_URL,
        description: 'Hi',
        buttonsEnabled: false,
        buttons: [],
      },
    });
    const captured = captureStartMessagePut();
    renderPage();

    await screen.findByRole('textbox', { name: 'Description' });
    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(captured.body).toBeDefined());
    expect(captured.body).toMatchObject({ messageType: 'text', imageUrl: null });
  });
});
