import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';

import {
  resetMockBots,
  resetMockKeyboards,
  resetMockMenus,
  resetMockMenuStrategies,
} from '@/mocks/handlers';
import { apiFail, apiOk } from '@/mocks/response';
import { server } from '@/mocks/server';
import { useBotStore } from '@/store/bot';
import { useUserStore } from '@/store/user';
import type { BotMenu, KeyboardButton, KeyboardButtonParams, MenuStrategy } from '@/types/bot';
import { DEFAULT_MESSAGE } from '@/utils/message-config';
import ButtonMenu from '@/views/content/button-menu';
import { BUTTON_MENU_MAX_COUNT } from '@/views/content/button-menu/constants';

const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BOT = { id: 'b1', telegramBotId: '7', username: 'shop_bot', displayName: 'Bit Store Card' };
const EMPTY_TEXT = /No custom menu configured yet/;

const button = (id: string, patch: Partial<KeyboardButton> = {}): KeyboardButton => ({
  id,
  text: `Button ${id}`,
  remark: '',
  messageType: 'text',
  imageUrl: null,
  description: 'Hello',
  linkUrl: null,
  buttonsEnabled: false,
  buttons: [],
  ...patch,
});

const menu = (id: string, command: string): BotMenu => ({
  id,
  command,
  commandDescription: `${command} description`,
  messageType: 'text',
  imageUrl: null,
  description: 'Hello',
  linkUrl: null,
  buttonsEnabled: false,
  buttons: [],
});

/** 空状态右侧卡片的新增按钮 */
const addFromCard = () => userEvent.click(screen.getByRole('button', { name: 'Add Button' }));
/** 手机预览里的新增入口 */
const addFromPreview = () => userEvent.click(screen.getByRole('button', { name: 'Add a button' }));

const nameInput = () => screen.getByRole('textbox', { name: 'Menu name' });
const rowCount = () => screen.queryAllByRole('group', { name: 'Menu row' }).length;
const wrapperOf = (name: string) => screen.getByRole('button', { name }).parentElement!;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ButtonMenu />
    </QueryClientProvider>,
  );
}

/** 把 source 拖到 target 上，使两者并排 */
function drag(source: HTMLElement, target: HTMLElement) {
  const dataTransfer = { setData: () => {}, effectAllowed: '' };
  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
}

describe('ButtonMenu', () => {
  beforeEach(() => {
    useUserStore.getState().setAuth({
      accessToken: 'jwt-keyboard',
      expiresIn: 3600,
      user: { id: 'u', telegramId: '1', firstName: '', lastName: '', username: '' },
    });
    resetMockBots([BOT]);
    resetMockKeyboards();
    useBotStore.getState().setSelectedBotId(BOT.id);
  });

  afterEach(() => {
    useUserStore.getState().logout();
    useBotStore.getState().setSelectedBotId(null);
    resetMockKeyboards();
  });

  it('初始没有按钮时显示空状态', async () => {
    renderPage();

    expect(await screen.findByText(EMPTY_TEXT)).toBeInTheDocument();
    expect(screen.queryByText('Menu information')).not.toBeInTheDocument();
    expect(screen.getByText(BOT.displayName)).toBeInTheDocument();
  });

  it('没有按钮时也显示下发策略，未保存过时是默认值', async () => {
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    expect(await screen.findByRole('switch', { name: 'Dispatch strategy' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '/menu' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'message' })).not.toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Default /menu command' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Save strategy' })).toBeDisabled();
  });

  it('读取已保存的下发策略', async () => {
    resetMockMenuStrategies({
      b1: { enabled: false, strategy: 'keyboard', defaultMenuId: null },
    });
    renderPage();

    expect(await screen.findByRole('switch', { name: 'Dispatch strategy' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Button menu' })).toBeChecked();
    expect(screen.getByText('Primary reply keyboard')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '/menu' })).toBeDisabled();
  });

  it('下发渠道单选，总开关关闭后全部禁用', async () => {
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await userEvent.click(screen.getByRole('radio', { name: 'message' }));
    expect(screen.getByRole('radio', { name: '/menu' })).not.toBeChecked();
    expect(screen.getByText('Standard chat message')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save strategy' })).toBeEnabled();

    await userEvent.click(screen.getByRole('switch', { name: 'Dispatch strategy' }));
    expect(screen.getByRole('radio', { name: '/menu' })).toBeDisabled();
  });

  it('保存下发策略时 PUT 三个字段，成功后保存按钮回到禁用', async () => {
    resetMockMenus({ b1: [menu('m1', 'help'), menu('m2', 'faq')] });
    let body: MenuStrategy | undefined;
    server.use(
      http.put(`${API}/bots/b1/menu-strategy`, async ({ request }) => {
        body = (await request.json()) as MenuStrategy;
        return apiOk(body);
      }),
    );
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await screen.findByRole('option', { name: '/faq' });
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Default /menu command' }),
      'm2',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save strategy' }));

    await waitFor(() =>
      expect(body).toEqual({ enabled: true, strategy: 'command', defaultMenuId: 'm2' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save strategy' })).toBeDisabled(),
    );
    expect(screen.getByRole('combobox', { name: 'Default /menu command' })).toHaveValue('m2');
  });

  it('保存下发策略失败时草稿保留，可以重试', async () => {
    server.use(
      http.put(`${API}/bots/b1/menu-strategy`, () => apiFail('1017', 'Telegram 拒绝同步', 400)),
    );
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await userEvent.click(screen.getByRole('radio', { name: 'message' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save strategy' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save strategy' })).toBeEnabled(),
    );
    expect(screen.getByRole('radio', { name: 'message' })).toBeChecked();
  });

  it('读取已保存的布局并按行展示，默认选中第一个', async () => {
    resetMockKeyboards({
      b1: [
        [button('1', { text: 'First' }), button('2', { text: 'Second' })],
        [button('3', { text: 'Third' })],
      ],
    });
    renderPage();

    expect(await screen.findByRole('button', { name: 'First', pressed: true })).toBeInTheDocument();
    expect(rowCount()).toBe(2);
    expect(nameInput()).toHaveValue('First');
  });

  it('新增按钮后选中它，并显示消息配置', async () => {
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();

    expect(screen.getByRole('button', { name: 'Button', pressed: true })).toBeInTheDocument();
    expect(screen.getByText('Menu information')).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_TEXT)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save and publish' })).toBeDisabled();
  });

  it('填写菜单名称后，预览里的按钮同步显示', async () => {
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();
    await userEvent.type(nameInput(), 'Create Card');

    expect(screen.getByRole('button', { name: 'Create Card' })).toBeInTheDocument();
  });

  it('切换按钮时，右侧显示各自的配置', async () => {
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();
    await userEvent.type(nameInput(), 'First');
    await addFromPreview();

    expect(nameInput()).toHaveValue('');

    await userEvent.click(screen.getByRole('button', { name: 'First' }));

    expect(nameInput()).toHaveValue('First');
  });

  it('消息类型切换后，显示对应的配置项', async () => {
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();
    expect(screen.getByText('Click to upload')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Link' }));
    expect(screen.getByRole('textbox', { name: 'External link' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Description' })).not.toBeInTheDocument();
  });

  it('开启操作按钮后可以填写名称', async () => {
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();
    expect(screen.queryByLabelText('Button name')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Action button' }));

    expect(screen.getByLabelText('Button name')).toBeInTheDocument();
  });

  it('删除未保存的草稿不发请求，删完回到空状态', async () => {
    let deleted = false;
    server.use(
      http.delete(`${API}/bots/b1/keyboard/buttons/:buttonId`, () => {
        deleted = true;
        return apiOk(null);
      }),
    );
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();
    await userEvent.click(screen.getByRole('button', { name: 'Remove Button' }));

    expect(screen.getByText(EMPTY_TEXT)).toBeInTheDocument();
    expect(deleted).toBe(false);
  });

  it('达到上限后隐藏预览里的新增入口', async () => {
    resetMockKeyboards({
      b1: Array.from({ length: BUTTON_MENU_MAX_COUNT }, (_, index) => [button(`k${index}`)]),
    });
    renderPage();

    expect(await screen.findByRole('button', { name: 'Button k0' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add a button' })).not.toBeInTheDocument();
  });

  it('保存新按钮时 POST，名称去掉首尾空格', async () => {
    let body: KeyboardButtonParams | undefined;
    server.use(
      http.post(`${API}/bots/b1/keyboard/buttons`, async ({ request }) => {
        body = (await request.json()) as KeyboardButtonParams;
        return apiOk({ id: 'k-new', ...body });
      }),
    );
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();
    await userEvent.type(nameInput(), ' Create Card ');
    await userEvent.type(screen.getByRole('textbox', { name: 'Menu description' }), 'note');
    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(body?.text).toBe('Create Card'));
    expect(body).toMatchObject({
      remark: 'note',
      messageType: 'text',
      imageUrl: null,
      description: DEFAULT_MESSAGE,
      linkUrl: null,
      buttonsEnabled: false,
      buttons: [],
    });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Create Card', pressed: true }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Save and publish' })).toBeDisabled();
  });

  it('不能以 / 开头，也不能和已有按钮重名', async () => {
    resetMockKeyboards({ b1: [[button('1', { text: 'First' })]] });
    renderPage();
    await screen.findByRole('button', { name: 'First' });

    await addFromPreview();
    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    await userEvent.type(nameInput(), '/start');
    expect(screen.getByRole('button', { name: 'Save and publish' })).toBeDisabled();

    await userEvent.clear(nameInput());
    await userEvent.type(nameInput(), 'First');
    expect(screen.getByRole('button', { name: 'Save and publish' })).toBeDisabled();

    await userEvent.type(nameInput(), '2');
    expect(screen.getByRole('button', { name: 'Save and publish' })).toBeEnabled();
  });

  it('保存失败时草稿保留，可以继续重试', async () => {
    server.use(
      http.post(`${API}/bots/b1/keyboard/buttons`, () =>
        apiFail('BAD_REQUEST', '按钮名称已存在', 400),
      ),
    );
    renderPage();
    await screen.findByText(EMPTY_TEXT);

    await addFromCard();
    await userEvent.type(nameInput(), 'Dup');
    await userEvent.click(screen.getByRole('radio', { name: 'Text message' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save and publish' })).toBeEnabled(),
    );
    expect(nameInput()).toHaveValue('Dup');
  });

  it('修改已保存的按钮时 PUT，Cancel 恢复到已保存内容', async () => {
    resetMockKeyboards({ b1: [[button('1', { text: 'First' })]] });
    let body: KeyboardButtonParams | undefined;
    server.use(
      http.put(`${API}/bots/b1/keyboard/buttons/1`, async ({ request }) => {
        body = (await request.json()) as KeyboardButtonParams;
        return apiOk({ id: '1', ...body });
      }),
    );
    renderPage();
    await screen.findByRole('button', { name: 'First' });

    await userEvent.type(nameInput(), ' X');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(nameInput()).toHaveValue('First');

    await userEvent.type(nameInput(), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Save and publish' }));

    await waitFor(() => expect(body?.text).toBe('First2'));
    expect(await screen.findByRole('button', { name: 'First2' })).toBeInTheDocument();
  });

  it('删除已保存的按钮时 DELETE，成功后才移除', async () => {
    resetMockKeyboards({
      b1: [[button('1', { text: 'First' })], [button('2', { text: 'Second' })]],
    });
    let deleted: string | undefined;
    server.use(
      http.delete(`${API}/bots/b1/keyboard/buttons/:buttonId`, ({ params }) => {
        deleted = String(params.buttonId);
        return apiOk(null);
      }),
    );
    renderPage();
    await screen.findByRole('button', { name: 'First' });

    await userEvent.click(screen.getByRole('button', { name: 'Remove First' }));

    await waitFor(() => expect(screen.queryByRole('button', { name: 'First' })).toBeNull());
    expect(deleted).toBe('1');
    expect(screen.getByRole('button', { name: 'Second', pressed: true })).toBeInTheDocument();
  });

  it('删除失败时按钮保留', async () => {
    resetMockKeyboards({ b1: [[button('1', { text: 'First' })]] });
    server.use(
      http.delete(`${API}/bots/b1/keyboard/buttons/1`, () =>
        apiFail('NOT_FOUND', '按钮不存在', 404),
      ),
    );
    renderPage();
    await screen.findByRole('button', { name: 'First' });

    await userEvent.click(screen.getByRole('button', { name: 'Remove First' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove First' })).toBeEnabled());
    expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
  });

  it('把一个按钮拖到另一个按钮上并排，并 PUT 保存后的布局', async () => {
    resetMockKeyboards({
      b1: [[button('1', { text: 'First' })], [button('2', { text: 'Second' })]],
    });
    let body: { rows: string[][] } | undefined;
    server.use(
      http.put(`${API}/bots/b1/keyboard/layout`, async ({ request }) => {
        body = (await request.json()) as { rows: string[][] };
        return apiOk({ rows: [[button('1', { text: 'First' }), button('2', { text: 'Second' })]] });
      }),
    );
    renderPage();
    await screen.findByRole('button', { name: 'First' });
    expect(rowCount()).toBe(2);

    drag(wrapperOf('Second'), wrapperOf('First'));

    await waitFor(() => expect(body).toEqual({ rows: [['1', '2']] }));
    expect(rowCount()).toBe(1);
  });

  it('布局保存失败时回滚到拖拽前', async () => {
    resetMockKeyboards({
      b1: [[button('1', { text: 'First' })], [button('2', { text: 'Second' })]],
    });
    let called = false;
    server.use(
      http.put(`${API}/bots/b1/keyboard/layout`, () => {
        called = true;
        return apiFail('BAD_REQUEST', '提交的按钮与现有按钮不一致，请刷新后重试', 400);
      }),
    );
    renderPage();
    await screen.findByRole('button', { name: 'First' });

    drag(wrapperOf('Second'), wrapperOf('First'));

    await waitFor(() => expect(called).toBe(true));
    await waitFor(() => expect(rowCount()).toBe(2));
  });

  it('未保存的草稿固定在最后，不能被拖拽', async () => {
    resetMockKeyboards({
      b1: [[button('1', { text: 'First' })]],
    });
    let called = false;
    server.use(
      http.put(`${API}/bots/b1/keyboard/layout`, () => {
        called = true;
        return apiOk({ rows: [] });
      }),
    );
    renderPage();
    await screen.findByRole('button', { name: 'First' });

    await addFromPreview();
    await userEvent.type(nameInput(), 'Draft');
    expect(wrapperOf('Draft')).toHaveAttribute('draggable', 'false');

    drag(wrapperOf('First'), wrapperOf('Draft'));
    drag(wrapperOf('Draft'), wrapperOf('First'));

    expect(rowCount()).toBe(2);
    expect(called).toBe(false);
  });
});
