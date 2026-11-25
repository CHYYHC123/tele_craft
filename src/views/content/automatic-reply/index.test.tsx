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

async function renderKeywordTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AutomaticReply />
    </QueryClientProvider>,
  );
  await screen.findByRole('button', { name: 'Add reply' });
}

const KEYWORD_AUTO_REPLY = {
  keywordEnabled: true,
  receiveEnabled: false,
  receiveContent: '',
  keywordReplies: [
    { id: 'r1', keywords: ['Hello', 'Hi'], content: 'Hi, welcome!' },
    { id: 'r2', keywords: ['Help'], content: 'How can we help?' },
  ],
};

describe('AutomaticReply - Keyword reply', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-keyword',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    resetMockBots([BOT]);
    resetMockAutoReplies({ b1: KEYWORD_AUTO_REPLY });
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useBotStore.getState().setSelectedBotId(null);
    resetMockAutoReplies();
  });

  it('回填服务端的开关和规则', async () => {
    await renderKeywordTab();

    expect(screen.getByRole('switch', { name: 'Automatic reply' })).toBeChecked();
    expect(screen.getByText('Hello, Hi')).toBeInTheDocument();
    expect(screen.getByText('How can we help?')).toBeInTheDocument();
  });

  it('新增：提交关键词数组和正文，并出现在表格里', async () => {
    let body: unknown;
    server.use(
      http.post(`${API}/bots/b1/keyword-replies`, async ({ request }) => {
        body = await request.json();
        return apiOk({ id: 'r3', keywords: ['Bye', 'Goodbye'], content: 'See you!' });
      }),
    );
    await renderKeywordTab();

    await userEvent.click(screen.getByRole('button', { name: 'Add reply' }));
    await userEvent.type(screen.getByRole('textbox', { name: /Keywords/ }), 'Bye, Goodbye');
    await userEvent.type(screen.getByRole('textbox', { name: /Reply content/ }), 'See you!');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Bye, Goodbye')).toBeInTheDocument();
    expect(body).toEqual({ keywords: ['Bye', 'Goodbye'], content: 'See you!' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('关键词以 / 开头时禁用保存', async () => {
    await renderKeywordTab();

    await userEvent.click(screen.getByRole('button', { name: 'Add reply' }));
    await userEvent.type(screen.getByRole('textbox', { name: /Keywords/ }), '/start');
    await userEvent.type(screen.getByRole('textbox', { name: /Reply content/ }), 'x');

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('cannot start with');
  });

  it('接口失败时弹窗保持打开', async () => {
    await renderKeywordTab();

    await userEvent.click(screen.getByRole('button', { name: 'Add reply' }));
    // 与已有规则 Help 重复，mock 返回 400 BAD_REQUEST
    await userEvent.type(screen.getByRole('textbox', { name: /Keywords/ }), 'help');
    await userEvent.type(screen.getByRole('textbox', { name: /Reply content/ }), 'dup');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('修改：整批提交关键词，保留自己原来的关键词不算重复', async () => {
    let body: unknown;
    server.use(
      http.put(`${API}/bots/b1/keyword-replies/r1`, async ({ request }) => {
        body = await request.json();
        return apiOk({ id: 'r1', keywords: ['Hello'], content: 'Updated reply' });
      }),
    );
    await renderKeywordTab();

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const keywords = screen.getByRole('textbox', { name: /Keywords/ });
    await userEvent.clear(keywords);
    await userEvent.type(keywords, 'Hello');
    const content = screen.getByRole('textbox', { name: /Reply content/ });
    await userEvent.clear(content);
    await userEvent.type(content, 'Updated reply');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Updated reply')).toBeInTheDocument();
    expect(body).toEqual({ keywords: ['Hello'], content: 'Updated reply' });
  });

  it('删除：成功后从表格移除，开关不变', async () => {
    await renderKeywordTab();

    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1]);

    await vi.waitFor(() => expect(screen.queryByText('How can we help?')).not.toBeInTheDocument());
    expect(screen.getByText('Hi, welcome!')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Automatic reply' })).toBeChecked();
  });

  it('关闭总开关只提交 keywordEnabled', async () => {
    let body: unknown;
    server.use(
      http.put(`${API}/bots/b1/auto-reply`, async ({ request }) => {
        body = await request.json();
        return apiOk({ ...KEYWORD_AUTO_REPLY, keywordEnabled: false });
      }),
    );
    await renderKeywordTab();

    await userEvent.click(screen.getByRole('switch', { name: 'Automatic reply' }));

    await vi.waitFor(() => expect(body).toEqual({ keywordEnabled: false }));
    await vi.waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Automatic reply' })).not.toBeChecked(),
    );
  });
});

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
