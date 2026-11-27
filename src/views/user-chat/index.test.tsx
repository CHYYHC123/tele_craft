import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';

import { resetMockBots, resetMockChats, type MockChatRecord } from '@/mocks/handlers';
import { apiFail } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useBotStore } from '@/store/bot';
import { useUserStore } from '@/store/user';
import type { ChatMessage, ChatStatus } from '@/types/chat';
import UserChat from '@/views/user-chat';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BOT = { id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'Bit Store Card' };

const at = (hour: number, minute: number) => new Date(2024, 7, 15, hour, minute).toISOString();

const message = (
  id: string,
  direction: ChatMessage['direction'],
  text: string,
  createdAt: string,
  patch: Partial<ChatMessage> = {},
): ChatMessage => ({
  id,
  direction,
  source: direction === 'in' ? 'user' : 'operator',
  messageType: 'text',
  text,
  imageUrl: null,
  telegramMessageId: 1,
  clientMessageId: null,
  createdAt,
  ...patch,
});

const chat = (
  id: string,
  firstName: string,
  messages: ChatMessage[],
  patch: { status?: ChatStatus; unreadCount?: number; unsubscribedAt?: string | null } = {},
): MockChatRecord => ({
  subscriber: {
    id,
    telegramUserId: `tg-${id}`,
    firstName,
    lastName: null,
    username: firstName.toLowerCase(),
    phone: null,
    firstSeenAt: at(9, 0),
    lastActiveAt: at(11, 0),
    unsubscribedAt: patch.unsubscribedAt ?? null,
    status: patch.status ?? 'open',
  },
  messages,
  unreadCount: patch.unreadCount ?? 0,
});

const ahmet = () =>
  chat(
    'c1',
    'Ahmet',
    [
      message('m1', 'in', 'Hello are you still there?', at(11, 43)),
      message('m2', 'in', 'Yes, that would be great.', at(11, 44)),
      message('m3', 'out', "I'm excited to get started on this project for you.", at(11, 45)),
    ],
    { unreadCount: 2 },
  );

const xiao = () => chat('c2', 'xiao', [message('m4', 'in', 'Hello', at(10, 0))]);

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <UserChat />
    </QueryClientProvider>,
  );
}

describe('UserChat', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-chat',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    resetMockBots([BOT]);
    useBotStore.getState().setSelectedBotId(BOT.id);
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useBotStore.getState().setSelectedBotId(null);
  });

  it('列表显示会话与未读数；选择会话后显示消息并清零未读', async () => {
    resetMockChats({ [BOT.id]: [ahmet(), xiao()] });
    renderPage();

    expect(await screen.findByRole('button', { name: /Ahmet/ })).toBeInTheDocument();
    expect(screen.getByText('Please select chat')).toBeInTheDocument();
    expect(screen.getByText('Open chats')).toBeInTheDocument();
    expect(screen.getByLabelText('2 chats')).toBeInTheDocument();
    expect(screen.getByLabelText('2 unread')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Ahmet/ }));

    expect(await screen.findByText('Yes, that would be great.')).toBeInTheDocument();
    expect(screen.queryByText('Please select chat')).not.toBeInTheDocument();
    // 打开会话会调用「标记已读」，列表刷新后未读数消失
    await waitFor(() => expect(screen.queryByLabelText('2 unread')).not.toBeInTheDocument());
  });

  it('静音会话后从 Open 列表移除，并出现在 Muted chats', async () => {
    resetMockChats({ [BOT.id]: [ahmet(), xiao()] });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Ahmet/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Mute chat' }));

    expect(await screen.findByText('Please select chat')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('button', { name: /Ahmet/ })).toBeNull());
    expect(screen.getByRole('button', { name: /xiao/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Chat folders' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: /Muted chats/ }));

    expect(await screen.findByRole('button', { name: /Ahmet/ })).toBeInTheDocument();
  });

  it('关闭会话后可在 Closed chats 里重新打开', async () => {
    resetMockChats({ [BOT.id]: [chat('c1', 'Ahmet', [message('m1', 'in', 'Hi', at(9, 0))])] });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Ahmet/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close chat' }));
    await screen.findByText('Please select chat');

    await userEvent.click(screen.getByRole('button', { name: 'Chat folders' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: /Closed chats/ }));
    await userEvent.click(await screen.findByRole('button', { name: /Ahmet/ }));

    // 已关闭的会话不能发送，只能重新打开
    expect(await screen.findByLabelText('Message')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Reopen chat' }));
    await screen.findByText('Please select chat');
    expect(await screen.findByText('No chat yet')).toBeInTheDocument();
  });

  it('Muted chats 为空时显示 No chat yet', async () => {
    resetMockChats({ [BOT.id]: [ahmet()] });
    renderPage();
    await screen.findByRole('button', { name: /Ahmet/ });

    await userEvent.click(screen.getByRole('button', { name: 'Chat folders' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: /Muted chats/ }));

    expect(await screen.findByText('No chat yet')).toBeInTheDocument();
  });

  it('搜索按姓名或用户名过滤会话', async () => {
    resetMockChats({ [BOT.id]: [ahmet(), xiao()] });
    renderPage();
    await screen.findByRole('button', { name: /Ahmet/ });

    await userEvent.type(screen.getByLabelText('Search chats'), 'xia');

    await waitFor(() => expect(screen.queryByRole('button', { name: /Ahmet/ })).toBeNull());
    expect(screen.getByRole('button', { name: /xiao/ })).toBeInTheDocument();
  });

  it('发送消息后追加到会话', async () => {
    resetMockChats({ [BOT.id]: [xiao()] });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /xiao/ }));
    await userEvent.type(await screen.findByLabelText('Message'), 'Hi there{Enter}');

    expect(await screen.findByText('Hi there', { selector: 'p' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(''));
  });

  it('发送失败时保留输入内容', async () => {
    resetMockChats({ [BOT.id]: [xiao()] });
    server.use(
      http.post(`${API}/bots/:id/chats/:chatId/messages`, () =>
        apiFail('1016', 'Telegram 发送失败', 400),
      ),
    );
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /xiao/ }));
    await userEvent.type(await screen.findByLabelText('Message'), 'Hi there{Enter}');

    await waitFor(() => expect(screen.getByLabelText('Message')).not.toBeDisabled());
    expect(screen.getByLabelText('Message')).toHaveValue('Hi there');
    expect(screen.queryByText('Hi there', { selector: 'p' })).not.toBeInTheDocument();
  });

  it('用户已屏蔽 Bot 时不能发送，资料面板有提示', async () => {
    resetMockChats({
      [BOT.id]: [
        chat('c1', 'Ahmet', [message('m1', 'in', 'Hi', at(9, 0))], {
          unsubscribedAt: at(12, 0),
        }),
      ],
    });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Ahmet/ }));

    await waitFor(() => expect(screen.getByLabelText('Message')).toBeDisabled());
    await userEvent.click(screen.getByRole('button', { name: 'Chat info' }));
    expect(await screen.findByText(/has blocked the bot/)).toBeInTheDocument();
    expect(screen.getByText('@ahmet')).toBeInTheDocument();
  });

  it('消息超过一页时可以加载更早的历史', async () => {
    const history = Array.from({ length: 35 }, (_, index) =>
      message(`h${index}`, 'in', `Message ${index}`, at(8, index)),
    );
    resetMockChats({ [BOT.id]: [chat('c1', 'Ahmet', history)] });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Ahmet/ }));
    expect(await screen.findByText('Message 34', { selector: 'p' })).toBeInTheDocument();
    expect(screen.queryByText('Message 0', { selector: 'p' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Load earlier messages' }));

    expect(await screen.findByText('Message 0', { selector: 'p' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load earlier messages' })).not.toBeInTheDocument();
  });

  it('选择图片后上传并以图片消息发出', async () => {
    resetMockChats({ [BOT.id]: [xiao()] });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /xiao/ }));
    await userEvent.type(await screen.findByLabelText('Message'), 'see this');
    await userEvent.upload(
      screen.getByLabelText('Image file'),
      new File(['x'], 'pic.png', { type: 'image/png' }),
    );

    const image = await screen.findByRole('img', { name: 'Sent image' });
    expect(image.getAttribute('src')).toContain('/chat/');
    expect(screen.getByText('see this', { selector: 'p' })).toBeInTheDocument();
  });

  it('图片消息显示图片和图注', async () => {
    resetMockChats({
      [BOT.id]: [
        chat('c1', 'Ahmet', [
          message('m1', 'in', 'my receipt', at(9, 0), {
            messageType: 'image',
            imageUrl: 'https://example.com/a.jpg',
          }),
        ]),
      ],
    });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Ahmet/ }));

    expect(await screen.findByRole('img', { name: 'Sent image' })).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    );
    expect(screen.getByText('my receipt', { selector: 'p' })).toBeInTheDocument();
  });
});
